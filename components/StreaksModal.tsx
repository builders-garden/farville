import { useFrameContext } from "@/context/FrameContext";
import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export default function StreaksModal({ onClose }: { onClose: () => void }) {
  const { safeAreaInsets, context } = useFrameContext();
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <div className='fixed inset-0 bg-black/50 flex items-start z-50'>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
        style={{
          marginTop: safeAreaInsets.top,
          marginBottom: safeAreaInsets.bottom,
          marginLeft: safeAreaInsets.left,
          marginRight: safeAreaInsets.right,
        }}
        className='bg-[#7E4E31] w-full h-full flex flex-col'
      >
        <div className='p-6 border-b border-[#8B5E3C]'>
          <div className='flex justify-between max-w-4xl mx-auto w-full'>
            <div className='flex flex-col gap-1'>
              <motion.h2
                className='text-white/90 font-bold text-2xl mb-1 flex items-center gap-2'
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
              >
                <Image
                  src='/images/icons/streaks.png'
                  alt='Streaks'
                  width={35}
                  height={35}
                />
                Streaks
              </motion.h2>
              <p className='text-white/60 text-[10px]'>
                Earn rewards farming daily!
              </p>
              <motion.p
                className='text-amber-500/90 text-[8px] drop-shadow-[0_0_3px_rgba(251,191,36,0.7)]'
                animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Plant, harvest or boost to keep it up
              </motion.p>
            </div>
            <button
              onClick={onClose}
              className='w-8 h-8 hover:bg-black/20 rounded-full transition-colors text-white/90 
                       flex items-center justify-center hover:rotate-90 transform duration-200'
            >
              ✕
            </button>
          </div>
        </div>
        <Calendar
          mode='single'
          selected={date}
          onSelect={setDate}
          className='rounded-md border w-fit m-auto mt-8'
        />
      </motion.div>
    </div>
  );
}
