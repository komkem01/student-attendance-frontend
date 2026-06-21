import { ref } from "vue";

export const useAddressSelector = () => {
  const districtsList = ref<{ id: string; name: string }[]>([]);
  const subdistrictsList = ref<{ id: string; name: string }[]>([]);

  const fetchDistricts = async (provinceID: string) => {
    try {
      const res: any = await useCustomFetch(
        `/system/district?province_id=${provinceID}`,
      );
      districtsList.value = res.data || [];
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSubdistricts = async (districtID: string) => {
    try {
      const res: any = await useCustomFetch(
        `/system/sub-district?district_id=${districtID}`,
      ); 
      subdistrictsList.value = res.data || [];
    } catch (e) {
      console.error(e);
    }
  };

  const fetchZipcode = async (subdistrictID: string) => {
    try {
      const res: any = await useCustomFetch(
        `/system/zipcode?sub_district_id=${subdistrictID}`,
      );
      const zipcodes = res.data || [];
      return zipcodes.length > 0 ? zipcodes[0].name : "";
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  const reset = () => {
    districtsList.value = [];
    subdistrictsList.value = [];
  };

  return {
    districtsList,
    subdistrictsList,
    fetchDistricts,
    fetchSubdistricts,
    fetchZipcode,
    reset,
  };
};
