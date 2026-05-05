'use client';

import React, { useState, useEffect } from 'react';
import styles from './Toast.module.css';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastInstance extends ToastProps {
  id: string;
}

interface ToastComponent extends React.FC {
  show: (toast: ToastProps) => void;
}

let showToast: (toast: ToastProps) => void;

const Toast: ToastComponent = () => {
  const [toasts, setToasts] = useState<ToastInstance[]>([]);

  useEffect(() => {
    showToast = ({ type, message }: ToastProps) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, message }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3000); // Уведомление исчезает через 3 секунды
    };
  }, []);

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
};

Toast.show = (toast: ToastProps) => {
  if (showToast) {
    showToast(toast);
  }
};

export default Toast;