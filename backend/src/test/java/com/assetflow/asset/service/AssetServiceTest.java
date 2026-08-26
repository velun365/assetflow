package com.assetflow.asset.service;

import com.assetflow.asset.Asset;
import com.assetflow.asset.AssetItem;
import com.assetflow.asset.image.ImagesStorageService;
import com.assetflow.asset.repository.AssetItemRepository;
import com.assetflow.asset.repository.AssetRepository;
import com.assetflow.asset.repository.CategoryRepository;
import com.assetflow.loan.repository.LoanRepository;
import com.assetflow.reservation.repository.ReservationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AssetServiceTest {

    @Mock
    private AssetRepository assetRepository;

    @Mock
    private AssetItemRepository assetItemRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private LoanRepository loanRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private ImagesStorageService imagesStorageService;

    @Mock
    private Asset asset;

    @Mock
    private AssetItem assetItem;

    @InjectMocks
    private AssetService assetService;

    @Test
    void 자산_품목이_없으면_자산을_삭제한다() {
        Long assetId = 1L;
        String imagePath = "/uploads/assets/test.png";
        when(assetRepository.findById(assetId)).thenReturn(Optional.of(asset));
        when(assetItemRepository.findByAssetId(assetId)).thenReturn(List.of());
        when(asset.getImagePath()).thenReturn(imagePath);

        assetService.assetDelete(assetId);

        verifyNoInteractions(loanRepository, reservationRepository);
        verify(assetItemRepository, never()).deleteAllInBatch(List.of());
        InOrder inOrder = inOrder(imagesStorageService, assetRepository);
        inOrder.verify(imagesStorageService).delete(imagePath);
        inOrder.verify(assetRepository).delete(asset);
    }

    @Test
    void 이력이_없는_자산_품목은_먼저_물리_삭제한_후_자산을_삭제한다() {
        Long assetId = 1L;
        String imagePath = "/uploads/assets/test.png";
        List<AssetItem> assetItems = List.of(assetItem);
        when(assetRepository.findById(assetId)).thenReturn(Optional.of(asset));
        when(assetItemRepository.findByAssetId(assetId)).thenReturn(assetItems);
        when(loanRepository.existsByAssetItemAssetId(assetId)).thenReturn(false);
        when(reservationRepository.existsByAssetItemAssetId(assetId)).thenReturn(false);
        when(asset.getImagePath()).thenReturn(imagePath);

        assetService.assetDelete(assetId);

        InOrder inOrder = inOrder(assetItemRepository, imagesStorageService, assetRepository);
        inOrder.verify(assetItemRepository).deleteAllInBatch(assetItems);
        inOrder.verify(imagesStorageService).delete(imagePath);
        inOrder.verify(assetRepository).delete(asset);
    }

    @Test
    void 대여_이력이_있는_자산은_삭제할_수_없다() {
        Long assetId = 1L;
        when(assetRepository.findById(assetId)).thenReturn(Optional.of(asset));
        when(assetItemRepository.findByAssetId(assetId)).thenReturn(List.of(assetItem));
        when(loanRepository.existsByAssetItemAssetId(assetId)).thenReturn(true);
        when(reservationRepository.existsByAssetItemAssetId(assetId)).thenReturn(false);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> assetService.assetDelete(assetId)
        );

        assertEquals(
                "대여 또는 예약 이력이 존재하는 자산은 삭제할 수 없습니다.",
                exception.getMessage()
        );
        verify(assetItemRepository, never()).deleteAllInBatch(List.of(assetItem));
        verifyNoInteractions(imagesStorageService);
        verify(assetRepository, never()).delete(asset);
    }

    @Test
    void 예약_이력이_있는_자산은_삭제할_수_없다() {
        Long assetId = 1L;
        when(assetRepository.findById(assetId)).thenReturn(Optional.of(asset));
        when(assetItemRepository.findByAssetId(assetId)).thenReturn(List.of(assetItem));
        when(loanRepository.existsByAssetItemAssetId(assetId)).thenReturn(false);
        when(reservationRepository.existsByAssetItemAssetId(assetId)).thenReturn(true);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> assetService.assetDelete(assetId)
        );

        assertEquals(
                "대여 또는 예약 이력이 존재하는 자산은 삭제할 수 없습니다.",
                exception.getMessage()
        );
        verify(assetItemRepository, never()).deleteAllInBatch(List.of(assetItem));
        verifyNoInteractions(imagesStorageService);
        verify(assetRepository, never()).delete(asset);
    }
}
