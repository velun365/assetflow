import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import "./AssetDetailPage.css";
import StatusBadge from "../../../shared/components/StatusBadge";
const AssetDetailPage = () => {
  const { assetId } = useParams();
  const [asset, setAsset] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAssetDetail = async () => {
      try {
        const response = await fetch(`/api/assets/${assetId}`);
        if (!response.ok) {
          throw new Error("자산상세목록 조회에 실패했습니다.");
        }
        const data = await response.json();
        setAsset(data);
      } catch (error) {
        setError(error.message);
      }
    };
    loadAssetDetail();
  }, [assetId]);

  if (error) {
    return <p className="error-message">{error}</p>;
  }
  if (!asset) {
    return <p className="empty-state">불러오는 중...</p>;
  }
  return (
    <div className="page asset-detail-page">
      <div className="page-heading">
        <div><h1>자산 상세</h1><p>자산 기본 정보와 소속 품목을 확인합니다.</p></div>
        <Link className="btn btn--secondary" to="/admin/assets">목록으로</Link>
      </div>
      <section className="card detail-hero">
        <div className="detail-image" aria-label="자산 이미지 영역">AF</div>
        <div className="detail-summary">
          <h2 className="detail-title">{asset.name}</h2>
          <dl className="detail-metrics">
            <div>
              <dt>카테고리</dt>
              <dd>{asset.categoryName}</dd>
            </div>
            <div>
              <dt>보유 수량</dt>
              <dd>{asset.totalCount}</dd>
            </div>
            <div>
              <dt>대여 가능 수량</dt>
              <dd>{asset.availableCount}</dd>
            </div>
          </dl>
          <div className="detail-description">
            <h3>설명</h3>
            <p>{asset.explanation || "등록된 설명이 없습니다."}</p>
          </div>
        </div>
      </section>
      <section className="table-card">
        <div className="card__header"><h2>자산 품목 목록</h2></div>
        {asset.assetItems.length === 0 ? (
          <p className="empty-state">등록된 자산 품목이 없습니다.</p>
        ) : (
          <div className="table-scroll"><table className="data-table">
            <thead>
              <tr>
                <th>품목번호</th>
                <th>시리얼 넘버</th>
                <th>위치</th>
                <th>상태</th>
              </tr>
            </thead>

            <tbody>
              {asset.assetItems.map((assetItem) => (
                <tr key={assetItem.assetItemId}>
                  <td>{assetItem.assetItemId}</td>
                  <td>{assetItem.serialNumber}</td>
                  <td>{assetItem.location}</td>
                  <td><StatusBadge status={assetItem.assetItemStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </section>
    </div>
  );
};

export default AssetDetailPage;
