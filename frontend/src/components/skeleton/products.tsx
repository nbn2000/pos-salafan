import { TableRow, TableCell } from '@/components/ui/table';
import { motion } from 'framer-motion';
import '@/styles/skeleton.css'; // Pastikan path ini sesuai dengan lokasi file CSS Anda

const SkeletonRow = ({ number = 8 }: { number?: number }) => {
  const variants = {
    initial: {
      opacity: 0.5,
    },
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1,
        repeat: Infinity,
      },
    },
  };

  return (
    <TableRow>
      {Array.from({ length: number }).map((_, i) => (
        <TableCell className="font-medium" key={i}>
          <motion.div
            className="h-8 w-[120px] md:w-[150px] skeleton"
            variants={variants}
            initial="initial"
            animate="animate"
          ></motion.div>
        </TableCell>
      ))}
    </TableRow>
  );
};

export default SkeletonRow;
