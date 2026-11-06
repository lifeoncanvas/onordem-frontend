import React, { createContext, useContext, useState, ReactNode } from "react";
import QrCodeModal from "@/components/web/QrCodeModal";

interface QrModalContextValue {
  openQrModal: (url?: string, initialTab?: "show" | "scan") => void;
  closeQrModal: () => void;
  isQrModalVisible: boolean;
}

const QrModalContext = createContext<QrModalContextValue>({
  openQrModal: () => {},
  closeQrModal: () => {},
  isQrModalVisible: false,
});

export function QrModalProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [modalUrl, setModalUrl] = useState("https://onodem.com");
  const [activeTab, setActiveTab] = useState<"show" | "scan">("show");

  const openQrModal = (url?: string, initialTab: "show" | "scan" = "show") => {
    if (url) setModalUrl(url);
    setActiveTab(initialTab);
    setVisible(true);
  };

  const closeQrModal = () => {
    setVisible(false);
  };

  return (
    <QrModalContext.Provider value={{ openQrModal, closeQrModal, isQrModalVisible: visible }}>
      {children}
      <QrCodeModal
        visible={visible}
        onClose={closeQrModal}
        appUrl={modalUrl}
        initialTab={activeTab}
      />
    </QrModalContext.Provider>
  );
}

export function useQrModal() {
  return useContext(QrModalContext);
}

