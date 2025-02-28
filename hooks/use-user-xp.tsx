import { useAudio } from "@/context/AudioContext";
import { useGame } from "@/context/GameContext";
import { LEVEL_REWARDS, LEVEL_XP_THRESHOLDS } from "@/lib/game-constants";

export const useUserXp = () => {
  const { state, updateUser, setShowLevelUpConfetti } = useGame();
  const { playSound } = useAudio();

  const addUserXpsAndCheckLevelUp = (xpToAdd: number) => {
    if (
      state.experience < LEVEL_XP_THRESHOLDS[state.level] &&
      state.experience + xpToAdd >= LEVEL_XP_THRESHOLDS[state.level]
    ) {
      updateUser({
        xp: state.experience + xpToAdd,
        level: state.level + 1,
        coins: state.coins + LEVEL_REWARDS[state.level].coins,
      });
      // Show level up confetti if player leveled up
      setShowLevelUpConfetti(true);
      playSound("levelUp");
      // Reset confetti after animation
      setTimeout(() => {
        setShowLevelUpConfetti(false);
      }, 3000);
    } else {
      updateUser({
        xp: state.experience + xpToAdd,
      });
    }
  };

  return { addUserXpsAndCheckLevelUp };
};
