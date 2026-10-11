export interface CampusConfig {
  name: string;
  shortName: string;
  city: string;
  latitude: number;
  longitude: number;
  roadWindingFactor: number;
  treeSequestrationPerYearKg: number; // 21.77 kg CO2 / year
}

export const CAMPUS_CONFIG: CampusConfig = {
  name: "RV Institute of Technology and Management",
  shortName: "RVITM",
  city: "Bengaluru, Karnataka, India",
  latitude: 12.8797,
  longitude: 77.5838,
  roadWindingFactor: 1.3,
  treeSequestrationPerYearKg: 21.77,
};

export interface LocalityOption {
  name: string;
  lat: number;
  lng: number;
  pincode?: string;
}

export const POPULAR_BENGALURU_LOCALITIES: LocalityOption[] = [
  { name: "JP Nagar 7th Phase, Bengaluru", lat: 12.8912, lng: 77.5768, pincode: "560078" },
  { name: "Jayanagar 4th Block, Bengaluru", lat: 12.9250, lng: 77.5838, pincode: "560011" },
  { name: "Banashankari 3rd Stage, Bengaluru", lat: 12.9255, lng: 77.5468, pincode: "560085" },
  { name: "BTM Layout 2nd Stage, Bengaluru", lat: 12.9166, lng: 77.6101, pincode: "560076" },
  { name: "HSR Layout Sector 1, Bengaluru", lat: 12.9121, lng: 77.6446, pincode: "560102" },
  { name: "Koramangala 5th Block, Bengaluru", lat: 12.9352, lng: 77.6245, pincode: "560095" },
  { name: "Electronic City Phase 1, Bengaluru", lat: 12.8452, lng: 77.6602, pincode: "560100" },
  { name: "Bannerghatta Road (Gottigere), Bengaluru", lat: 12.8596, lng: 77.5855, pincode: "560083" },
  { name: "Kanakapura Road (Konanakunte), Bengaluru", lat: 12.8893, lng: 77.5552, pincode: "560062" },
  { name: "Whitefield, Bengaluru", lat: 12.9698, lng: 77.7500, pincode: "560066" },
  { name: "Indiranagar 100ft Road, Bengaluru", lat: 12.9784, lng: 77.6408, pincode: "560038" },
  { name: "Malleshwaram, Bengaluru", lat: 13.0031, lng: 77.5643, pincode: "560003" },
  { name: "Rajajinagar, Bengaluru", lat: 12.9982, lng: 77.5530, pincode: "560010" },
  { name: "Yelahanka New Town, Bengaluru", lat: 13.1007, lng: 77.5963, pincode: "560064" },
  { name: "Kengeri Satellite Town, Bengaluru", lat: 12.9177, lng: 77.4838, pincode: "560060" },
  { name: "Basavanagudi, Bengaluru", lat: 12.9421, lng: 77.5753, pincode: "560004" },
  { name: "Bellandur Outer Ring Road, Bengaluru", lat: 12.9260, lng: 77.6762, pincode: "560103" },
  { name: "Marathahalli, Bengaluru", lat: 12.9591, lng: 77.6974, pincode: "560037" }
];
