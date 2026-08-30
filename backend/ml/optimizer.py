import numpy as np

class SmartOptimizer:
    def __init__(self):
        self.subsystems = [
            {'name': 'Critical Systems', 'priority': 'Priority 1', 'kw': 18.0, 'essential': True, 'color': '#00E5FF'},
            {'name': 'Heating (Essential)', 'priority': 'Priority 1', 'kw': 12.0, 'essential': True, 'color': '#FF3D71'},
            {'name': 'Research Equipment', 'priority': 'Priority 2', 'kw': 10.0, 'essential': False, 'color': '#48CAE4'},
            {'name': 'Water System', 'priority': 'Priority 2', 'kw': 6.0, 'essential': False, 'shiftable': True, 'color': '#00C9A7'},
            {'name': 'Lighting', 'priority': 'Priority 3', 'kw': 4.0, 'essential': False, 'dimmable': True, 'color': '#FFB300'},
            {'name': 'Non-critical Loads', 'priority': 'Priority 4', 'kw': 8.0, 'essential': False, 'curtailable': True, 'color': '#64748B'},
        ]

    def solve(self, current_load=39.0, renewable_gen=43.0, battery_soc=74.0, min_reserve=30.0):
        # Uncurtailed peak load
        baseline_peak = 58.0
        curtailed_p4 = 8.0 # Shed non-critical
        shifted_p2_water = 3.0 # Shift water heating to solar peak
        
        optimized_peak = baseline_peak - curtailed_p4 - shifted_p2_water # 47.0 kW
        saved_kw = baseline_peak - optimized_peak # 11.0 kW

        battery_protected_soc = max(min_reserve + 4.0, 34.0)
        diesel_avoided = 4.8 # hours

        recommendations = [
            {
                'id': 1,
                'title': 'Reduce Non-critical Loads',
                'reason': 'Predicted demand surge exceeds renewable generation capacity.',
                'saving': 'Save 8.0 kW',
                'priority': 'Priority 4',
                'status': 'Active / Recommended',
            },
            {
                'id': 2,
                'title': 'Shift Water Heating to 14:00 - 16:00',
                'reason': 'Aligns thermal water storage with peak polar solar generation window.',
                'saving': 'Save 3.0 kW',
                'priority': 'Priority 2',
                'status': 'Active / Scheduled',
            },
            {
                'id': 3,
                'title': 'Maintain Battery Reserve above 30%',
                'reason': 'Preserves essential nocturnal emergency reserve buffer.',
                'saving': 'Reserve Protection',
                'priority': 'Critical Rule',
                'status': 'Enforced',
            },
            {
                'id': 4,
                'title': 'Start Diesel Generator if Load > 55 kW',
                'reason': 'Engage diesel backup strictly if combined renewables + battery cannot supply P1/P2 loads.',
                'saving': 'Auto-Trigger',
                'priority': 'Backup Contingency',
                'status': 'Standby Armed',
            },
        ]

        load_priorities = [
            {'name': 'Critical Systems', 'priority': 'Priority 1', 'kw': 18, 'action': 'Fully Protected (100%)', 'color': '#00E5FF'},
            {'name': 'Heating (Essential)', 'priority': 'Priority 1', 'kw': 12, 'action': 'Fully Protected (100%)', 'color': '#FF3D71'},
            {'name': 'Research Equipment', 'priority': 'Priority 2', 'kw': 10, 'action': 'Continuous Supply', 'color': '#48CAE4'},
            {'name': 'Water System', 'priority': 'Priority 2', 'kw': 6, 'action': 'Shifted (-3 kW to 14:00)', 'color': '#00C9A7'},
            {'name': 'Lighting', 'priority': 'Priority 3', 'kw': 4, 'action': 'Optimized LED Dimming', 'color': '#FFB300'},
            {'name': 'Non-critical Loads', 'priority': 'Priority 4', 'kw': 8, 'action': 'Shedded / Curtailed (-8 kW)', 'color': '#64748B'},
        ]

        dispatch_curve = [
            {'time': '10:00', 'baseline': 42, 'optimized': 39, 'solar': 24, 'wind': 15, 'battery': 0},
            {'time': '12:00', 'baseline': 46, 'optimized': 40, 'solar': 28, 'wind': 15, 'battery': 0},
            {'time': '14:00', 'baseline': 52, 'optimized': 44, 'solar': 27, 'wind': 16, 'battery': 1},
            {'time': '16:00', 'baseline': 58, 'optimized': 47, 'solar': 14, 'wind': 17, 'battery': 16},
            {'time': '18:00', 'baseline': 56, 'optimized': 46, 'solar': 5, 'wind': 18, 'battery': 23},
            {'time': '20:00', 'baseline': 50, 'optimized': 42, 'solar': 0, 'wind': 17, 'battery': 25},
            {'time': '22:00', 'baseline': 45, 'optimized': 38, 'solar': 0, 'wind': 16, 'battery': 22},
        ]

        return {
            'baseline_demand_kw': baseline_peak,
            'optimized_demand_kw': optimized_peak,
            'saved_kw': saved_kw,
            'battery_soc_protected': battery_protected_soc,
            'diesel_avoided_hours': diesel_avoided,
            'recommendations': recommendations,
            'load_priorities': load_priorities,
            'dispatch_curve': dispatch_curve,
        }

optimizer = SmartOptimizer()
