import React from "react";
import { Check } from "lucide-react";
import styles from "./Stepper.module.css";

// Component hiển thị các bước của luồng Đặt hàng: Giỏ hàng -> Thông tin -> Thanh toán -> Hoàn tất
const Stepper = ({ currentStep = 1 }) => {
  const steps = [
    { step: 1, label: "Giỏ hàng" },
    { step: 2, label: "Thông tin nhận hàng" },
    { step: 3, label: "Thanh toán" },
    { step: 4, label: "Hoàn tất đơn" },
  ];

  return (
    <div className={styles.stepperContainer}>
      <ol className={styles.stepperList}>
        {steps.map((item, index) => {
          const isCompleted = item.step < currentStep;
          const isActive = item.step === currentStep;

          let stepClass = styles.stepItem;
          if (isActive) stepClass += ` ${styles.active}`;
          if (isCompleted) stepClass += ` ${styles.completed}`;

          return (
            <React.Fragment key={item.step}>
              <li className={stepClass}>
                <span className={styles.stepNumber}>
                  {isCompleted ? <Check size={16} strokeWidth={2.2} /> : item.step}
                </span>
                <span className={styles.stepLabel}>{item.label}</span>
              </li>
              {index < steps.length - 1 && <span className={styles.stepDivider} />}
            </React.Fragment>
          );
        })}
      </ol>
    </div>
  );
};

export default Stepper;
