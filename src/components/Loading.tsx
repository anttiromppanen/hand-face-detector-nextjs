import styles from "./Loading.module.css";
import { SyncLoader } from "react-spinners";
import { motion } from "framer-motion";

interface LoadingProps {
  text?: string;
  size?: "md" | "lg";
}

function Loading({ text, size = "lg" }: LoadingProps) {
  return (
    <motion.div
      key="loading"
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className={styles.container}
    >
      <div className={styles.loader_container}>
        <div className={styles.content_container}>
          <motion.h1
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className={size === "lg" ? styles.text_lg : styles.text_sm}
          >
            {text || "Loading"}
          </motion.h1>
          <motion.div initial={{ x: 20 }} animate={{ x: 0 }}>
            <SyncLoader
              size={size === "lg" ? 20 : 12}
              color="#FBFF12"
              className={styles.loading_animation}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default Loading;
