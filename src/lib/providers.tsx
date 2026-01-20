"use client";

import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { ConfigProvider, App, theme } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import { store } from "@/store";
import { soundManager } from "@/lib/sounds";

// Custom Pharma ERP Theme Colors
const pharmaTheme = {
  token: {
    colorPrimary: "#1890ff",
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    colorInfo: "#1890ff",
    borderRadius: 8,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    // Slightly smaller font for compact enterprise tables
    fontSize: 13,
  },
  components: {
    Layout: {
      headerBg: "#001529",
      siderBg: "#001529",
      bodyBg: "#f0f2f5",
    },
    Menu: {
      darkItemBg: "#001529",
      darkItemSelectedBg: "#1890ff",
      darkItemHoverBg: "rgba(255, 255, 255, 0.08)",
    },
    Table: {
      headerBg: "#fafafa",
      headerColor: "#262626",
      rowHoverBg: "#f0f7ff",
      cellPaddingBlock: 10,
      cellPaddingInline: 12,
      fontSize: 12,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Button: {
      borderRadius: 6,
      controlHeight: 34,
    },
    Input: {
      borderRadius: 6,
      controlHeight: 34,
    },
    Select: {
      controlHeight: 34,
    },
    Drawer: {
      paddingLG: 20,
    },
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 30 * 60 * 1000, // 30 minutes (cacheTime renamed to gcTime in v5)
            refetchOnWindowFocus: false,
            retry: 2,
          },
          mutations: {
            onSuccess: () => {
              soundManager.playSuccess();
            },
            onError: () => {
              soundManager.playError();
            },
          },
        },
      })
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Initialize sound settings from localStorage
    const soundEnabled = localStorage.getItem('soundEnabled');
    if (soundEnabled !== null) {
      soundManager.setEnabled(JSON.parse(soundEnabled));
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <StyleProvider hashPriority="high">
          <ConfigProvider
            theme={{
              ...pharmaTheme,
              algorithm: theme.defaultAlgorithm,
            }}
          >
            <App>{children}</App>
          </ConfigProvider>
        </StyleProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
