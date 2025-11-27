import { fetchCommunities } from '../src/utils/api.js';
import { sampleCommunities } from '../utils/dummyData';
import { DUMMY_DATA_ENABLED } from '../utils/featureFlags';

export const Community = {
  async list() {
    try {
      const apiCommunities = await fetchCommunities();
      if (Array.isArray(apiCommunities) && apiCommunities.length > 0) {
        return apiCommunities;
      }
    } catch (error) {
      if (!DUMMY_DATA_ENABLED) {
        throw error;
      }
    }

    if (DUMMY_DATA_ENABLED) {
      return sampleCommunities;
    }

    return [];
  },
  async filter() {
    return [];
  },
};

export default Community;
