export function getServiceNumberMotion(index: number, reducedMotion: boolean) {
  const resting = { opacity: 1, y: 0, scale: 1 };
  const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

  if (reducedMotion) {
    return {
      initial: resting,
      visible: resting,
      hover: { scale: 1, color: "#70a6ff" },
      transition: { duration: 0, delay: 0, ease },
    };
  }

  return {
    initial: { opacity: 0, y: 24, scale: 0.85 },
    visible: resting,
    hover: { scale: 1.08, color: "#9bc0ff" },
    transition: { duration: 0.7, delay: 0.12 * (index + 1), ease },
  };
}
