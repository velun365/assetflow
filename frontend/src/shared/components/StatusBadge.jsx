const STATUS_LABELS = {
  ACTIVE: "활성",
  INACTIVE: "비활성",
  SUSPENDED: "정지",
  AVAILABLE: "대여 가능",
  RENTED: "대여 중",
  OVERDUE: "연체",
  RETURN_REQUESTED: "반납 요청",
  RETURNED: "반납 완료",
  WAITING: "대기 중",
  READY: "대여 준비",
  COMPLETED: "완료",
  CANCELED: "취소",
  BROKEN: "고장",
  DISPOSED: "폐기",
};

const STATUS_TONES = {
  ACTIVE: "success",
  AVAILABLE: "success",
  RETURNED: "neutral",
  COMPLETED: "success",
  RENTED: "primary",
  READY: "primary",
  WAITING: "warning",
  RETURN_REQUESTED: "warning",
  OVERDUE: "danger",
  CANCELED: "neutral",
  INACTIVE: "neutral",
  SUSPENDED: "danger",
  BROKEN: "danger",
  DISPOSED: "neutral",
};

const StatusBadge = ({ status }) => {
  const tone = STATUS_TONES[status] || "neutral";

  return (
    <span className={`status-badge status-badge--${tone}`}>
      {STATUS_LABELS[status] || status || "-"}
    </span>
  );
};

export default StatusBadge;
