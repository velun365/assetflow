package com.assetflow.asset.service;

import com.assetflow.asset.Asset;
import com.assetflow.asset.AssetItem;
import com.assetflow.asset.dto.AssetItemAdminResponse;
import com.assetflow.asset.dto.AssetItemCreateRequest;
import com.assetflow.asset.dto.AssetItemCreateResponse;
import com.assetflow.asset.dto.AssetItemResponse;
import com.assetflow.asset.dto.AssetItemSearchCondition;
import com.assetflow.asset.repository.AssetItemRepository;
import com.assetflow.asset.repository.AssetRepository;
import com.assetflow.loan.LoanStatus;
import com.assetflow.loan.repository.LoanRepository;
import com.assetflow.member.Member;
import com.assetflow.reservation.ReservationStatus;
import com.assetflow.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AssetItemService {
    private final AssetItemRepository assetItemRepository;
    private final AssetRepository assetRepository;
    private final ReservationRepository reservationRepository;
    private final LoanRepository loanRepository;

    public Page<AssetItemAdminResponse> getAllAssetItems(
            AssetItemSearchCondition condition,
            Pageable pageable
    ) {
        return assetItemRepository.searchAssetItems(condition, pageable);
    }

    @Transactional
    public AssetItemCreateResponse createAssetItem(AssetItemCreateRequest request) {
        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new IllegalStateException("해당 자산은 자산목록에 없습니다."));
        AssetItem assetItem = new AssetItem(
                request.getSerialNumber(),
                request.getLocation(),
                asset
        );
        assetItemRepository.save(assetItem);
        AssetItemCreateResponse response = new AssetItemCreateResponse(
                assetItem.getId(),
                assetItem.getSerialNumber(),
                assetItem.getLocation(),
                request.getAssetId(),
                assetItem.getAssetItemStatus()
        );

        return response;
    }

    @Transactional
    public void deleteAssetItem(Long assetItemId){
        AssetItem assetItem = assetItemRepository.findById(assetItemId)
                .orElseThrow(() -> new IllegalStateException(
                        "해당 자산 품목을 찾을 수 없습니다."
                ));
        boolean hasReadyReservation = reservationRepository.existsByAssetItemIdAndReservationStatus(
                assetItemId,
                ReservationStatus.READY
        );

        if(hasReadyReservation) {
            throw new IllegalStateException("대여 준비 중인 예약이 있어 폐기할 수 없습니다.");

        }

        assetItem.dispose();
    }

    public List<AssetItemResponse> getAssetItemsByAsset(Long assetId, Member member) {
        List<AssetItem> assetItems = assetItemRepository.findByAssetId(assetId);
        return assetItems.stream()
                .map(assetItem -> {
                    boolean hasReadyReservation = reservationRepository.existsByAssetItemIdAndReservationStatus(
                            assetItem.getId(),
                            ReservationStatus.READY
                    );
                    boolean readyByMe =
                            reservationRepository.existsByMemberIdAndAssetItemIdAndReservationStatusIn(
                                    member.getId(),
                                    assetItem.getId(),
                                    List.of(
                                            ReservationStatus.READY
                                    )
                            );
                    boolean reservedByMe =
                            reservationRepository.existsByMemberIdAndAssetItemIdAndReservationStatusIn(
                                    member.getId(),
                                    assetItem.getId(),
                                    List.of(
                                            ReservationStatus.WAITING,
                                            ReservationStatus.READY
                                    )
                            );

                    boolean borrowedByMe = loanRepository.existsByMemberIdAndAssetItemIdAndLoanStatusIn(
                            member.getId(),
                            assetItem.getId(),
                            List.of(
                                    LoanStatus.RENTED,
                                    LoanStatus.OVERDUE,
                                    LoanStatus.RETURN_REQUESTED
                            )
                    );
                    return new AssetItemResponse(
                            assetItem.getId(),
                            assetItem.getSerialNumber(),
                            assetItem.getLocation(),
                            assetItem.getAssetItemStatus(),
                            assetItem.getAsset().getId(),
                            assetItem.getAsset().getName(),
                            hasReadyReservation,
                            readyByMe,
                            borrowedByMe,
                            reservedByMe
                    );
                })
                .toList();

    }
}
