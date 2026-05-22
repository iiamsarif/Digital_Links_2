import { motion } from "framer-motion";

export default function MagneticButton({ children, light = false }) {
  return (
    <motion.a
      href="#booking"
      className={`magnetic-button ${light ? "magnetic-button--light" : ""}`}
      whileHover={{ y: -3, scale: 1.025 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 360, damping: 24 }}
    >
      <span>{children}</span>
    </motion.a>
  );
}
