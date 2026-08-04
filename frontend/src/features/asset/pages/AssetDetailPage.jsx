import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import "./AssetDetailPage.css";
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
    return <p>{error}</p>;
  }
  if (!asset) {
    return <p>불러오는중...</p>;
  }
  return (
    <div className="asset-detail-page">
      <Link to="/admin/assets">목록으로</Link> <br />
      <h1>자산 상세</h1>
      <section className="asset-info">
        <div className="image-box">이미지</div>

        <div className="asset-summary">
          <h2>{asset.name}</h2>

          <table>
            <tbody>
              <tr>
                <th>카테고리</th>
                <td>{asset.categoryName}</td>
                <th>보유수량</th>
                <td>{asset.totalCount}</td>
                <th>대여가능</th>
                <td>{asset.availableCount}</td>
              </tr>

              <tr>
                <th>설명</th>
                <td colSpan="5">{asset.explanation}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2>자산 품목 목록</h2>

        {asset.assetItems.length === 0 ? (
          <p>등록된 자산 품목이 없습니다.</p>
        ) : (
          <table>
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
                  <td>{assetItem.assetItemStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default AssetDetailPage;
