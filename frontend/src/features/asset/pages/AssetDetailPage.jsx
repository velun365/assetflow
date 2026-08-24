import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./AssetDetailPage.css";
import StatusBadge from "../../../shared/components/StatusBadge";
import { AuthContext } from "../../auth/context/AuthContext";
import { getCsrfToken } from "../../../shared/api/csrfFetch";

const fetchAssetDetail = async (assetId) => {
  const response = await fetch(`/api/assets/${assetId}`);

  if (!response.ok) {
    throw new Error("자산상세목록 조회에 실패했습니다.");
  }

  return response.json();
};

const getErrorMessage = async (response, fallbackMessage) => {
  try {
    const data = await response.json();
    return data.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

const AssetDetailPage = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [asset, setAsset] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadAssetDetail = async () => {
      try {
        setAsset(await fetchAssetDetail(assetId));
      } catch (error) {
        setError(error.message);
      }
    };
    loadAssetDetail();
  }, [assetId]);

  const reloadAssetDetail = async () => {
    setAsset(await fetchAssetDetail(assetId));
  };

  const updateImage = async () => {
    try {
      setError("");
      setMessage("");

      if (!selectedImage) {
        throw new Error("교체할 이미지를 선택해주세요.");
      }

      const formData = new FormData();
      formData.append("image", selectedImage);

      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/assets/${assetId}/image`, {
        method: "PATCH",
        headers: {
          "X-XSRF-TOKEN": csrfToken,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "이미지 교체에 실패했습니다."),
        );
      }

      await reloadAssetDetail();
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setMessage("대표 이미지가 교체되었습니다.");
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteImage = async () => {
    try {
      setError("");
      setMessage("");

      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/assets/${assetId}/image`, {
        method: "DELETE",
        headers: {
          "X-XSRF-TOKEN": csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "이미지 삭제에 실패했습니다."),
        );
      }

      await reloadAssetDetail();
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setMessage("대표 이미지가 삭제되었습니다.");
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteAsset = async () => {
    if (!window.confirm("이 자산을 삭제하시겠습니까?")) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/assets/${assetId}`, {
        method: "DELETE",
        headers: {
          "X-XSRF-TOKEN": csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "자산 삭제에 실패했습니다."),
        );
      }

      navigate("/admin/assets");
    } catch (error) {
      setError(error.message);
    }
  };

  if (!asset) {
    return error ? (
      <p className="error-message">{error}</p>
    ) : (
      <p className="empty-state">불러오는 중...</p>
    );
  }
  return (
    <div className="page asset-detail-page">
      <div className="page-heading">
        <div>
          <h1>자산 상세</h1>
          <p>자산 기본 정보와 소속 품목을 확인합니다.</p>
        </div>
        <div className="detail-heading-actions">
          <Link
            className="btn btn--secondary"
            to={user?.role === "USER" ? "/loans/new" : "/admin/assets"}
          >
            목록으로
          </Link>
          {user?.role === "ADMIN" && (
            <button
              type="button"
              className="btn btn--danger"
              onClick={deleteAsset}
            >
              자산 삭제
            </button>
          )}
        </div>
      </div>
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}
      <section className="card detail-hero">
        <div className="detail-image-column">
          <div className="detail-image" aria-label="자산 이미지 영역">
            {asset.imagePath ? (
              <img
                src={asset.imagePath}
                alt={asset.name}
                className="detail-image__img"
              />
            ) : (
              "AF"
            )}
          </div>
          {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
            <div className="detail-image-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                aria-label="대표 이미지 선택"
                onChange={(event) =>
                  setSelectedImage(event.target.files?.[0] ?? null)
                }
              />
              <div className="detail-image-actions__buttons">
                <button
                  type="button"
                  className="btn btn--secondary"
                  disabled={!selectedImage}
                  onClick={updateImage}
                >
                  이미지 교체
                </button>
                {user?.role === "ADMIN" && asset.imagePath && (
                  <button
                    type="button"
                    className="btn btn--danger"
                    onClick={deleteImage}
                  >
                    이미지 삭제
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
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
        <div className="card__header">
          <h2>자산 품목 목록</h2>
        </div>
        {asset.assetItems.length === 0 ? (
          <p className="empty-state">등록된 자산 품목이 없습니다.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>시리얼 넘버</th>
                  <th>위치</th>
                  <th>상태</th>
                </tr>
              </thead>

              <tbody>
                {asset.assetItems.map((assetItem) => (
                  <tr key={assetItem.assetItemId}>
                    <td>{assetItem.serialNumber}</td>
                    <td>{assetItem.location}</td>
                    <td>
                      {assetItem.assetItemStatus === "AVAILABLE" &&
                      assetItem.hasReadyReservation ? (
                        <span className="status-badge status-badge--primary">
                          예약자 대여 대기
                        </span>
                      ) : (
                        <StatusBadge status={assetItem.assetItemStatus} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AssetDetailPage;
