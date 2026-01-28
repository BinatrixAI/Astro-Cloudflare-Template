import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface CurvedMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Custom curved sliding mobile menu component.
 * Slides from right with a curved SVG edge for visual appeal.
 * More reliable than HeroUI NavbarMenu which can have toggle issues.
 */
export function CurvedMenu({ isOpen, onClose, children, className }: CurvedMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed top-0 right-0 h-full w-80 bg-background z-50 shadow-2xl",
              className
            )}
          >
            {/* Curved edge SVG */}
            <svg
              className="absolute left-0 top-0 h-full w-8 -translate-x-full"
              viewBox="0 0 32 100"
              preserveAspectRatio="none"
            >
              <path
                d="M32 0 C16 0, 0 20, 0 50 C0 80, 16 100, 32 100 L32 0"
                fill="currentColor"
                className="text-background"
              />
            </svg>
            
            {/* Menu content */}
            <div className="h-full overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface MenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function MenuItem({ children, onClick, className }: MenuItemProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full text-left py-3 px-4 rounded-lg hover:bg-content2 transition-colors",
        className
      )}
    >
      {children}
    </motion.button>
  );
}
