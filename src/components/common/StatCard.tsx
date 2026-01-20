"use client";

import React from "react";
import { Card, Statistic, Row, Col, Tooltip, Progress } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

interface StatCardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  precision?: number;
  trend?: "up" | "down" | "neutral";
  trendValue?: number | string;
  trendLabel?: string;
  icon?: React.ReactNode;
  color?: string;
  loading?: boolean;
  tooltip?: string;
  progress?: number;
  progressColor?: string;
}

export default function StatCard({
  title,
  value,
  prefix,
  suffix,
  precision = 0,
  trend,
  trendValue,
  trendLabel,
  icon,
  color = "#1890ff",
  loading = false,
  tooltip,
  progress,
  progressColor,
}: StatCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "#52c41a";
      case "down":
        return "#ff4d4f";
      default:
        return "#8c8c8c";
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <ArrowUpOutlined />;
      case "down":
        return <ArrowDownOutlined />;
      default:
        return null;
    }
  };

  return (
    <Card
      loading={loading}
      style={{
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        border: "none",
        height: "100%",
      }}
      styles={{
        body: {
          padding: 20,
        },
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                color: "#8c8c8c",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {title}
            </span>
            {tooltip && (
              <Tooltip title={tooltip}>
                <InfoCircleOutlined style={{ color: "#bfbfbf", fontSize: 12 }} />
              </Tooltip>
            )}
          </div>

          <Statistic
            value={value}
            prefix={prefix}
            suffix={suffix}
            precision={precision}
            styles={{
              content: {
                color: color,
                fontSize: 28,
                fontWeight: 700,
              },
            }}
          />

          {(trend || trendValue) && (
            <div
              style={{
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ color: getTrendColor(), fontSize: 13 }}>
                {getTrendIcon()} {trendValue}
              </span>
              {trendLabel && (
                <span style={{ color: "#8c8c8c", fontSize: 13 }}>
                  {trendLabel}
                </span>
              )}
            </div>
          )}

          {typeof progress === "number" && (
            <Progress
              percent={progress}
              showInfo={false}
              strokeColor={progressColor || color}
              railColor="#f0f0f0"
              size="small"
              style={{ marginTop: 12 }}
            />
          )}
        </div>

        {icon && (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: `${color}10`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              color: color,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// Pre-made stats grid component
interface StatsGridProps {
  stats: StatCardProps[];
  loading?: boolean;
}

export function StatsGrid({ stats, loading = false }: StatsGridProps) {
  return (
    <Row gutter={[16, 16]}>
      {stats.map((stat, index) => (
        <Col xs={24} sm={12} lg={6} key={index}>
          <StatCard {...stat} loading={loading} />
        </Col>
      ))}
    </Row>
  );
}
