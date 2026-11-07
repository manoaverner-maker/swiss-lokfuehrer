import { motion, type HTMLMotionProps } from 'framer-motion'
import { sfx, unlockAudio } from '../audio/engine'

type Props = HTMLMotionProps<'button'> & {
  color?: string
  textColor?: string
  sound?: keyof typeof sfx | null
}

/** Big, bouncy, touch-friendly button (min. 64×64 px). */
export function ToyButton({ color = '#E30613', textColor = '#fff', sound = 'tap', className = '', style, onClick, children, ...rest }: Props) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      className={`toy-btn ${className}`}
      style={{ background: color, color: textColor, ...style }}
      onClick={(e) => {
        unlockAudio()
        if (sound) sfx[sound]()
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
