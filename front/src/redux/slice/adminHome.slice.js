import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const DEFAULT_LAYOUT = [
    'hero_section',
    'category_section',
    'most_popular',
    'banner_slot_1',
    'new_arrivals',
    'best_sellers',
    'banner_slot_2',
    'shop_style',
    'top_checks'
];

const DEFAULT_BANNER_CONFIG = {
    banner_slot_1: 'single',
    banner_slot_2: 'single'
};

export const fetchHomeSettings = createAsyncThunk(
    'adminHome/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/settings');
            const data = response.data.data;
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const saveHomeSettings = createAsyncThunk(
    'adminHome/saveSettings',
    async ({ layout, bannerConfig, bannerSelections }, { rejectWithValue, dispatch }) => {
        try {
            const requests = [
                axiosInstance.post('/settings', {
                    key: 'homepage_layout',
                    value: layout,
                    description: 'Order of sections on the home page'
                }),
                axiosInstance.post('/settings', {
                    key: 'banner_slots_config',
                    value: bannerConfig,
                    description: 'Configuration for banner slots (single/split)'
                }),
                axiosInstance.post('/settings', {
                    key: 'banner_slot_assignments',
                    value: bannerSelections,
                    description: 'Specific banner assignments for slots'
                })
            ];

            await Promise.all(requests);
            toast.success('Home page layout saved!');
            return { layout, bannerConfig, bannerSelections };
        } catch (error) {
            toast.error('Failed to save layout');
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const adminHomeSlice = createSlice({
    name: 'adminHome',
    initialState: {
        layout: DEFAULT_LAYOUT,
        bannerConfig: DEFAULT_BANNER_CONFIG,
        bannerSelections: {},
        loading: false,
        saving: false,
        error: null,
    },
    reducers: {
        setLayout: (state, action) => {
            state.layout = action.payload;
        },
        setBannerConfig: (state, action) => {
            state.bannerConfig = action.payload;
        },
        setBannerSelections: (state, action) => {
            state.bannerSelections = action.payload;
        },
        addBannerSlot: (state) => {
            const newKey = `banner_slot_${Date.now()}`;
            state.layout.push(newKey);
            state.bannerConfig[newKey] = 'single';
        },
        removeBannerSlot: (state, action) => {
            const keyToRemove = action.payload;
            state.layout = state.layout.filter(key => key !== keyToRemove);
            delete state.bannerConfig[keyToRemove];
            delete state.bannerSelections[keyToRemove];
        },
        toggleBannerMode: (state, action) => {
            const slotKey = action.payload;
            const current = state.bannerConfig[slotKey] || 'single';
            let next = 'single';
            if (current === 'single') next = 'split';
            else if (current === 'split') next = 'triple';
            else next = 'single';
            state.bannerConfig[slotKey] = next;
        },
        updateBannerSelection: (state, action) => {
            const { slotKey, index, bannerId } = action.payload;
            if (!state.bannerSelections[slotKey]) {
                state.bannerSelections[slotKey] = [];
            }
            state.bannerSelections[slotKey][index] = bannerId;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchHomeSettings.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchHomeSettings.fulfilled, (state, action) => {
                state.loading = false;
                const settings = action.payload;

                // Parse Layout
                const layoutSetting = settings.find(s => s.key === 'homepage_layout');
                if (layoutSetting && Array.isArray(layoutSetting.value)) {
                    const mergedLayout = [...layoutSetting.value];
                    DEFAULT_LAYOUT.forEach(key => {
                        if (!key.startsWith('banner_slot') && !mergedLayout.includes(key)) {
                            mergedLayout.push(key);
                        }
                    });
                    state.layout = mergedLayout;
                }

                // Parse Banner Config
                const configSetting = settings.find(s => s.key === 'banner_slots_config');
                if (configSetting && configSetting.value) {
                    state.bannerConfig = { ...state.bannerConfig, ...configSetting.value };
                }

                // Parse Banner Selections
                const selectionSetting = settings.find(s => s.key === 'banner_slot_assignments');
                if (selectionSetting && selectionSetting.value) {
                    state.bannerSelections = selectionSetting.value;
                }
            })
            .addCase(fetchHomeSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(saveHomeSettings.pending, (state) => {
                state.saving = true;
            })
            .addCase(saveHomeSettings.fulfilled, (state) => {
                state.saving = false;
            })
            .addCase(saveHomeSettings.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            });
    },
});

export const {
    setLayout,
    setBannerConfig,
    setBannerSelections,
    addBannerSlot,
    removeBannerSlot,
    toggleBannerMode,
    updateBannerSelection
} = adminHomeSlice.actions;

export default adminHomeSlice.reducer;
