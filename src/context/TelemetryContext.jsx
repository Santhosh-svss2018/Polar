import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';

const TelemetryContext = createContext(null);

export function TelemetryProvider({ children }) {
  const [simState, setSimState] = useState(() => {
    const saved = localStorage.getItem('polar_telemetry_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      scenarioMode: 'clear', // 'clear', 'medium', 'hard' (Situation Severity)
      irradiance: 82,
      windSpeed: 24,
      gridLoad: 621,
      weather: 'Clear',
      batteryStrategy: 'Balanced',
      emergencyDiesel: false,
      solarOutput: 284,
      solarEfficiency: 91,
      solarChange: '+8.4%',
      solarRisk: false, // Solar risk state (turns red only in danger)
      solarRiskMessage: '',
      windOutput: 412,
      windChange: '+12.1%',
      windRisk: false, // Wind turbine danger zone
      windRiskMessage: '',
      batterySOC: 78,
      batteryPower: 146,
      batteryHealth: 96,
      batteryChange: '+4.2%',
      batteryRisk: false, // Battery critical risk state (<30%)
      batteryRiskMessage: '',
      dieselOutput: 0,
      dieselFuelPercent: 84,
      dieselFuelLiters: 37800,
      dieselCapacityLiters: 45000,
      dieselBurnRateLph: 0.0,
      dieselRemainingHours: 440,
      dieselStatus: 'STANDBY',
      dieselRisk: false, // Diesel is only at risk if fuel < 15%
      gridStatus: 'NORMAL',
      gridRisk: false,
      aiStatus: 'OPTIMAL',
      aiMessage: 'Renewable generation is currently sufficient to meet demand. Battery storage is charging and diesel backup remains offline.',
      efficiency: '94.2%',
      forecast: 'Stable',
      co2Saved: '1.82 t',
      resilienceScore: 92,
      lastUpdated: new Date().toISOString(),
    };
  });

  const [activeAlerts, setActiveAlerts] = useState(() => {
    return [
      {
        id: 'ALT-LIVE-101',
        severity: 'info',
        title: 'Bharati Autonomous Grid Synchronized',
        equipment: 'Microgrid Supervisory Bus',
        desc: 'All renewable generation vectors operating normally in balance.',
        value: '621 kW Load Satisfied',
        timestamp: 'Just now',
        status: 'Active',
      },
    ];
  });

  // Danger Zone Popup Modal State
  const [dangerPopup, setDangerPopup] = useState(null);
  const lastDangerTriggeredRef = useRef({});

  const [simulationHistory, setSimulationHistory] = useState([
    {
      id: 1,
      time: '18:40',
      mode: 'Clear Situation',
      renewablePct: 100,
      dieselUsed: '0 L',
      loadKw: 621,
      status: 'Optimal (All Safe)',
    },
    {
      id: 2,
      time: '18:25',
      mode: 'Medium Situation',
      renewablePct: 91,
      dieselUsed: '12 L',
      loadKw: 710,
      status: 'Moderate Stress Buffer',
    },
  ]);

  // Initial fetch from FastAPI backend to sync in real-time
  useEffect(() => {
    const fetchBackendTelemetry = async () => {
      try {
        const live = await api.getLiveTelemetry();
        if (live && live.gridLoad) {
          setSimState((prev) => ({ ...prev, ...live }));
        }
      } catch (err) {
        console.warn('Real-time backend telemetry init:', err.message);
      }
    };
    fetchBackendTelemetry();
  }, []);

  // Sync state to backend (debounced)
  const syncTimerRef = useRef(null);
  const syncToBackend = (state) => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      try {
        await api.updateLiveTelemetry(state);
      } catch (err) {
        // Fallback silently if offline
      }
    }, 400);
  };

  // Recalculate full physics and risk states on any change
  const updateSimulationState = (updatedFields) => {
    setSimState((prev) => {
      const merged = { ...prev, ...updatedFields };
      const { irradiance, windSpeed, gridLoad, weather, batteryStrategy, emergencyDiesel } = merged;

      // 1. Weather Impact Factor
      let weatherFactor = 1.0;
      if (weather === 'Cloudy') weatherFactor = 0.65;
      if (weather === 'Snow') weatherFactor = 0.45;
      if (weather === 'Storm') weatherFactor = 0.22;

      // 2. Solar Generation & Solar Risk State
      const newSolar = Math.max(0, Math.round(350 * (irradiance / 100) * weatherFactor));
      const newSolarEff = Math.round(Math.max(8, Math.min(99, 70 + (irradiance * 0.25) * weatherFactor)));
      
      // Solar is in DANGER state if output is 0 while demand is high, or storm collapses output
      const solarRisk = (irradiance < 20 && gridLoad > 500) || (weather === 'Storm' && newSolar < 40) || newSolar === 0;
      const solarRiskMessage = solarRisk
        ? (newSolar === 0 ? 'CRITICAL DANGER: Zero solar harvest due to polar night/storm obscuration.' : 'DANGER ZONE: Solar harvest severely degraded under subzero storm conditions.')
        : '';

      // 3. Wind Generation & Wind Danger Zone State
      let windEfficiency = Math.min(1.25, windSpeed / 28);
      if (weather === 'Storm') windEfficiency *= 1.35;
      const newWind = Math.max(0, Math.round(550 * (windEfficiency * 0.75)));
      
      // Wind Danger Zone: stall (< 6 km/h) or storm over-speed (> 50 km/h yaw strain)
      const windRisk = windSpeed < 6 || windSpeed > 50;
      const windRiskMessage = windSpeed < 6
        ? 'TURBINE DANGER ZONE: Wind velocity below cut-in threshold (Stall Hazard at 5 km/h).'
        : windSpeed > 50
        ? 'TURBINE DANGER ZONE: Wind velocity exceeds 50 km/h! Severe yaw and blade shear strain.'
        : '';

      // 4. Energy Balance & Storage
      const totalRenewable = newSolar + newWind;
      const netSurplus = totalRenewable - gridLoad;

      let newBatteryPower = 0;
      let newBatterySOC = prev.batterySOC;
      let newDiesel = emergencyDiesel ? 350 : 0;
      let newAIStatus = 'OPTIMAL';
      let newAIMsg = '';

      if (netSurplus >= 0) {
        // Surplus: Battery Charges
        newBatteryPower = Math.min(250, netSurplus);
        newBatterySOC = Math.min(100, Math.max(30, Math.round(72 + (newBatteryPower / 250) * 26)));
        if (!emergencyDiesel) newDiesel = 0;
        newAIStatus = 'OPTIMAL';
        newAIMsg = `Renewable generation (${totalRenewable} kW) is currently sufficient to meet demand. Battery storage is charging (+${newBatteryPower} kW) and diesel backup remains offline.`;
      } else {
        // Deficit: Battery Discharges
        const deficit = Math.abs(netSurplus);
        if (batteryStrategy === 'Emergency Reserve' && prev.batterySOC <= 35) {
          newDiesel = Math.min(500, deficit);
          newBatteryPower = 0;
          newAIStatus = 'WARNING';
          newAIMsg = `Battery reserve held at ${prev.batterySOC}%. Emergency diesel dispatched at ${newDiesel} kW to satisfy load deficit.`;
        } else if (prev.batterySOC > 30) {
          newBatteryPower = -Math.min(300, deficit);
          newBatterySOC = Math.max(22, Math.round(74 - (deficit / 300) * 35));
          newAIStatus = newBatterySOC < 35 ? 'WARNING' : 'OPTIMAL';
          newAIMsg = `Renewable deficit of ${deficit} kW actively supplied via LiFePO4 battery storage reserve. Current SOC: ${newBatterySOC}%.`;
        } else {
          newDiesel = Math.min(500, deficit);
          newBatteryPower = 0;
          newAIStatus = 'CRITICAL';
          newAIMsg = `Battery depleted below safety threshold. Emergency diesel generator running at ${newDiesel} kW.`;
        }
      }

      // Battery Risk State (<30% is critical)
      const batteryRisk = newBatterySOC < 30;
      const batteryRiskMessage = batteryRisk
        ? `BATTERY DANGER ZONE: SOC at ${newBatterySOC}% (Below 30% Safety Buffer)!`
        : '';

      // Diesel Fuel & Burn Rate Calculations (Diesel is NOT in danger by default)
      const dieselBurnRateLph = newDiesel > 0 ? Number(((newDiesel / 500) * 95.0).toFixed(1)) : 0.0;
      const dieselFuelPercent = prev.dieselFuelPercent || 84;
      const dieselFuelLiters = Math.round((dieselFuelPercent / 100) * 45000);
      const dieselRemainingHours = dieselBurnRateLph > 0 ? Math.round(dieselFuelLiters / dieselBurnRateLph) : 480;
      // Diesel is ONLY in danger if fuel is critically low (<15%)
      const dieselRisk = dieselFuelPercent < 15;

      // Overall Grid Risk
      const gridRisk = (solarRisk && windRisk) || batteryRisk || newAIStatus === 'CRITICAL' || gridLoad > 850;

      // Resilience Score (0 - 100)
      let resilience = 94;
      if (solarRisk) resilience -= 15;
      if (windRisk) resilience -= 12;
      if (batteryRisk) resilience -= 28;
      if (newDiesel > 0) resilience -= 6;
      if (gridLoad > 800) resilience -= 12;
      resilience = Math.max(18, Math.min(100, resilience));

      // Assess Scenario Situation Mode (Clear / Medium / Hard)
      let scenarioMode = merged.scenarioMode || 'clear';
      if (newAIStatus === 'CRITICAL' || solarRisk || batteryRisk || gridLoad > 850 || windRisk) {
        scenarioMode = 'hard';
      } else if (newAIStatus === 'WARNING' || weather === 'Snow' || weather === 'Cloudy') {
        scenarioMode = 'medium';
      }

      // POPUP MESSAGE TRIGGER FOR DANGER ZONE (e.g. Turbine in danger zone, Solar danger, Battery danger)
      const nowMs = Date.now();
      if (windRisk && (!lastDangerTriggeredRef.current.wind || nowMs - lastDangerTriggeredRef.current.wind > 15000)) {
        lastDangerTriggeredRef.current.wind = nowMs;
        const alertObj = {
          equipment: 'WIND TURBINE WT-01 / WT-02',
          title: windSpeed < 6 ? 'Turbine Danger Zone: Sub-Cut-In Velocity Stall' : 'Turbine Danger Zone: Extreme Blizzard Velocity Strain',
          desc: windRiskMessage,
          value: `${windSpeed} km/h Velocity`,
          severity: 'critical',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setDangerPopup(alertObj);
        api.recordDangerAlert(alertObj).catch(() => {});
      } else if (batteryRisk && (!lastDangerTriggeredRef.current.battery || nowMs - lastDangerTriggeredRef.current.battery > 15000)) {
        lastDangerTriggeredRef.current.battery = nowMs;
        const alertObj = {
          equipment: 'BATTERY STORAGE BANK B (1.2 MWh)',
          title: 'Battery Danger Zone: Depleted Below 30% Safety Threshold',
          desc: batteryRiskMessage,
          value: `${newBatterySOC}% SOC`,
          severity: 'critical',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setDangerPopup(alertObj);
        api.recordDangerAlert(alertObj).catch(() => {});
      } else if (solarRisk && (!lastDangerTriggeredRef.current.solar || nowMs - lastDangerTriggeredRef.current.solar > 15000)) {
        lastDangerTriggeredRef.current.solar = nowMs;
        const alertObj = {
          equipment: 'PHOTOVOLTAIC BIFACIAL ARRAY 01-04',
          title: 'Solar Harvest Danger Zone: Total Generation Collapse',
          desc: solarRiskMessage,
          value: `${newSolar} kW Output`,
          severity: 'critical',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setDangerPopup(alertObj);
        api.recordDangerAlert(alertObj).catch(() => {});
      }

      // Sync Dynamic Alerts
      const dynamicAlertsList = [];
      if (windRisk) {
        dynamicAlertsList.push({
          id: 'ALT-WIND-DANGER',
          severity: 'critical',
          title: windSpeed < 6 ? 'Turbine Sub-Cut-In Velocity Stall' : 'High Velocity Wind Overload Strain',
          equipment: 'Turbine WT-01 & WT-02',
          desc: windRiskMessage,
          value: `${windSpeed} km/h Wind`,
          timestamp: 'Just now (Stored Notification)',
          status: 'Active',
        });
      }
      if (batteryRisk) {
        dynamicAlertsList.push({
          id: 'ALT-BATT-DANGER',
          severity: 'critical',
          title: 'Battery Reserve Depleted Below 30%',
          equipment: 'Station Battery Bank B (1.2 MWh LiFePO4)',
          desc: `Current SOC is ${newBatterySOC}%. Polar emergency threshold breached.`,
          value: `${newBatterySOC}% SOC`,
          timestamp: 'Just now (Stored Notification)',
          status: 'Active',
        });
      }
      if (solarRisk) {
        dynamicAlertsList.push({
          id: 'ALT-SOLAR-DANGER',
          severity: 'critical',
          title: 'Solar Generation Critical Deficit',
          equipment: 'Photovoltaic Array 01-04 (Bifacial)',
          desc: solarRiskMessage || 'Solar generation collapsed below threshold.',
          value: `${newSolar} kW Output`,
          timestamp: 'Just now (Stored Notification)',
          status: 'Active',
        });
      }
      if (newDiesel > 0) {
        dynamicAlertsList.push({
          id: 'ALT-DIESEL-ACTIVE',
          severity: 'warning',
          title: 'Emergency Diesel Backup Online (Genset Active)',
          equipment: 'Genset Substation 01',
          desc: `Providing ${newDiesel} kW load support at ${dieselBurnRateLph} L/h fuel combustion.`,
          value: `${newDiesel} kW Dispatch`,
          timestamp: 'Just now (Stored Notification)',
          status: 'Active',
        });
      }

      if (dynamicAlertsList.length === 0) {
        dynamicAlertsList.push({
          id: 'ALT-NORMAL-01',
          severity: 'info',
          title: 'Bharati Grid Autonomous Balance Nominal',
          equipment: 'Microgrid Inverter & Central Hub',
          desc: '100% renewable utilization with positive battery charge buffer.',
          value: `${totalRenewable} kW Available`,
          timestamp: 'Just now (Live Digital Twin)',
          status: 'Active',
        });
      }

      setActiveAlerts(dynamicAlertsList);

      const updatedState = {
        ...merged,
        scenarioMode,
        solarOutput: newSolar,
        solarEfficiency: newSolarEff,
        solarRisk,
        solarRiskMessage,
        windOutput: newWind,
        windRisk,
        windRiskMessage,
        gridLoad,
        gridRisk,
        batterySOC: newBatterySOC,
        batteryPower: newBatteryPower,
        batteryRisk,
        batteryRiskMessage,
        dieselOutput: newDiesel,
        dieselFuelPercent,
        dieselFuelLiters,
        dieselBurnRateLph,
        dieselRemainingHours,
        dieselStatus: newDiesel > 0 ? 'ACTIVE GENERATION' : 'STANDBY',
        dieselRisk,
        gridStatus: gridLoad > 750 ? 'HIGH LOAD' : 'NORMAL',
        aiStatus: newAIStatus,
        aiMessage: newAIMsg,
        resilienceScore: resilience,
        efficiency: `${Math.min(99.4, Math.max(82, (totalRenewable / Math.max(1, gridLoad)) * 94)).toFixed(1)}%`,
        co2Saved: `${(1.1 + (totalRenewable / 800) * 0.9).toFixed(2)} t`,
        lastUpdated: new Date().toISOString(),
      };

      try {
        localStorage.setItem('polar_telemetry_state', JSON.stringify(updatedState));
      } catch (e) {}

      syncToBackend(updatedState);

      return updatedState;
    });
  };

  // 1-Click Situation Switcher: CLEAR SITUATION, MEDIUM SITUATION, HARD SITUATION
  const applyScenarioPreset = (mode) => {
    if (mode === 'clear') {
      updateSimulationState({
        scenarioMode: 'clear',
        irradiance: 88,
        windSpeed: 28,
        gridLoad: 580,
        weather: 'Clear',
        batteryStrategy: 'Balanced',
        emergencyDiesel: false,
      });
      setSimulationHistory((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: 'Clear Situation',
          renewablePct: 100,
          dieselUsed: '0 L',
          loadKw: 580,
          status: 'Optimal (All Safe)',
        },
        ...prev.slice(0, 9),
      ]);
    } else if (mode === 'medium') {
      updateSimulationState({
        scenarioMode: 'medium',
        irradiance: 40,
        windSpeed: 16,
        gridLoad: 720,
        weather: 'Snow',
        batteryStrategy: 'Grid Support',
        emergencyDiesel: false,
      });
      setSimulationHistory((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: 'Medium Situation',
          renewablePct: 84,
          dieselUsed: '15 L',
          loadKw: 720,
          status: 'Moderate Stress Buffer',
        },
        ...prev.slice(0, 9),
      ]);
    } else if (mode === 'hard') {
      // Hard Situation (Danger Zone - Turbines in stall/gale, Solar obscured)
      updateSimulationState({
        scenarioMode: 'hard',
        irradiance: 5,
        windSpeed: 5, // Stall Danger Zone for Turbines!
        gridLoad: 890,
        weather: 'Storm',
        batteryStrategy: 'Emergency Reserve',
        emergencyDiesel: true,
      });
      setSimulationHistory((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: 'Hard Situation (Danger Zone)',
          renewablePct: 22,
          dieselUsed: '145 L',
          loadKw: 890,
          status: 'Critical Alert Defense',
        },
        ...prev.slice(0, 9),
      ]);
    }
  };

  const dismissDangerPopup = () => setDangerPopup(null);

  return (
    <TelemetryContext.Provider
      value={{
        simState,
        activeAlerts,
        simulationHistory,
        dangerPopup,
        dismissDangerPopup,
        updateSimulationState,
        applyScenarioPreset,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
}

export default TelemetryContext;
