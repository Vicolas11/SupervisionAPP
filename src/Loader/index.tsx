import { PuffLoader } from "react-spinners";
import styles from "./styles.module.scss";

export default function Loader() {
  return (
    <div className={styles.loader}>
      <PuffLoader color="#fffff6" size={24} />
    </div>
  );
}
