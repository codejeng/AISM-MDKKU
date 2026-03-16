export interface BodySite {
  name: string;
  label: string;
  labelTh: string;
  region: 'head' | 'torso' | 'upper_limb' | 'lower_limb';
  side?: 'left' | 'right';
}

export const BODY_SITES: BodySite[] = [
  // Head
  { name: 'face', label: 'Face', labelTh: 'ใบหน้า', region: 'head' },
  // Torso
  { name: 'chest', label: 'Chest (Anterior)', labelTh: 'หน้าอก', region: 'torso' },
  { name: 'abdomen', label: 'Abdomen', labelTh: 'ท้อง', region: 'torso' },
  // Upper Limbs
  { name: 'right_upper_arm', label: 'Right Upper Arm', labelTh: 'ต้นแขนขวา', region: 'upper_limb', side: 'right' },
  { name: 'left_upper_arm', label: 'Left Upper Arm', labelTh: 'ต้นแขนซ้าย', region: 'upper_limb', side: 'left' },
  { name: 'right_forearm', label: 'Right Forearm', labelTh: 'ปลายแขนขวา', region: 'upper_limb', side: 'right' },
  { name: 'left_forearm', label: 'Left Forearm', labelTh: 'ปลายแขนซ้าย', region: 'upper_limb', side: 'left' },
  { name: 'right_hand', label: 'Right Hand (Dorsum)', labelTh: 'หลังมือขวา', region: 'upper_limb', side: 'right' },
  { name: 'left_hand', label: 'Left Hand (Dorsum)', labelTh: 'หลังมือซ้าย', region: 'upper_limb', side: 'left' },
  { name: 'right_fingers', label: 'Right Fingers', labelTh: 'นิ้วมือขวา', region: 'upper_limb', side: 'right' },
  { name: 'left_fingers', label: 'Left Fingers', labelTh: 'นิ้วมือซ้าย', region: 'upper_limb', side: 'left' },
  // Lower Limbs
  { name: 'right_thigh', label: 'Right Thigh', labelTh: 'ต้นขาขวา', region: 'lower_limb', side: 'right' },
  { name: 'left_thigh', label: 'Left Thigh', labelTh: 'ต้นขาซ้าย', region: 'lower_limb', side: 'left' },
  { name: 'right_lower_leg', label: 'Right Lower Leg', labelTh: 'ขาส่วนล่างขวา', region: 'lower_limb', side: 'right' },
  { name: 'left_lower_leg', label: 'Left Lower Leg', labelTh: 'ขาส่วนล่างซ้าย', region: 'lower_limb', side: 'left' },
  { name: 'right_foot', label: 'Right Foot (Dorsum)', labelTh: 'หลังเท้าขวา', region: 'lower_limb', side: 'right' },
  { name: 'left_foot', label: 'Left Foot (Dorsum)', labelTh: 'หลังเท้าซ้าย', region: 'lower_limb', side: 'left' },
];

export const BODY_REGIONS = [
  { key: 'head', label: 'Head', labelTh: 'ศีรษะ', icon: '🧑' },
  { key: 'torso', label: 'Torso', labelTh: 'ลำตัว', icon: '👕' },
  { key: 'upper_limb', label: 'Upper Limbs', labelTh: 'แขน/มือ', icon: '💪' },
  { key: 'lower_limb', label: 'Lower Limbs', labelTh: 'ขา/เท้า', icon: '🦵' },
] as const;
