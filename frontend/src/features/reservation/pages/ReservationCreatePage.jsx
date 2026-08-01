import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAssetItems } from "../api/fetchAssetItems";

const ReservationCreatePage = () => {
  const [reservation, setReservation] = useState({
    memberId: 2,
    assetItemId: "",
  });
  const [assetItems, setAssetItems] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!reservation.assetItemId) {
        setError("자산 품목을 선택해주세요.");
        return;
      }
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservation),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "예약 실패");
      }
      navigate("/reservations");
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    const loadAssetItems = async () => {
      try {
        const data = await fetchAssetItems();
        setAssetItems(data);
      } catch (error) {
        setError(error.message);
      }
    };

    loadAssetItems();
  }, []);
  const onChangeReservation = (e) => {
    setReservation({
      ...reservation,
      [e.target.name]: Number(e.target.value),
    });
  };

  return (
    <div>
      <h1>예약페이지</h1>
      {error && <p>{error}</p>}
      <form action="" onSubmit={handleSubmit}>
        <select
          name="assetItemId"
          id="assetItemId"
          value={reservation.assetItemId}
          onChange={onChangeReservation}
        >
          <option value="">자산 품목을 선택하세요</option>
          {assetItems.map((assetItem) => (
            <option key={assetItem.assetItemId} value={assetItem.assetItemId}>
              {assetItem.assetName} - {assetItem.serialNumber}
            </option>
          ))}
        </select>
        <button type="submit">예약하기</button>
      </form>
    </div>
  );
};

export default ReservationCreatePage;
