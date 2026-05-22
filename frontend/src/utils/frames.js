const studioPrefix =
  "Firefly A high-fidelity minimalist 3D animation set within a seamless, solid matte neutral gray stud_";

const applePrefix =
  "Firefly A high-end 3D animation featuring the Apple logo from -Screenshot 2026-04-30 122010.png- cen (online-video-cutter.com)_";

const pad = (number) => String(number).padStart(3, "0");

const buildFrames = (folder, prefix, count) =>
  Array.from({ length: count }, (_, index) => encodeURI(`/${folder}/${prefix}${pad(index)}.jpg`));

export const heroFrames = buildFrames("frames", studioPrefix, 80);
export const appleFrames = buildFrames("Apple_Frame", applePrefix, 58);
