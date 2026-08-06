package com.assetflow.reservation;

import com.assetflow.asset.AssetItem;
import com.assetflow.member.Member;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reservation {
    @Id
    @GeneratedValue
    @Column(name = "reservation_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_item_id")
    private AssetItem assetItem;

    @Enumerated(EnumType.STRING)
    private ReservationStatus reservationStatus;

    private LocalDateTime reservedAt;

    public void changeMember(Member member) {
        this.member = member;
        member.getReservations().add(this);
    }

    public void changeAssetItem(AssetItem assetItem) {
        this.assetItem = assetItem;
        assetItem.getReservations().add(this);
    }

    public Reservation(Member member, AssetItem assetItem) {
        changeMember(member);
        changeAssetItem(assetItem);
        this.reservationStatus = ReservationStatus.WAITING;
        reservedAt = LocalDateTime.now();
    }

    public void cancel() {
        if (this.reservationStatus == ReservationStatus.COMPLETED) {
            throw new IllegalStateException("완료된 예약은 취소할 수 없습니다.");
        }

        if (this.reservationStatus == ReservationStatus.CANCELED) {
            throw new IllegalStateException("이미 취소된 예약입니다.");
        }
        this.reservationStatus = ReservationStatus.CANCELED;
    }

    public void ready() {
        if (this.reservationStatus != ReservationStatus.WAITING) {
            throw new IllegalStateException(
                    "대기 중인 예약만 준비 상태로 변경할 수 있습니다."
            );
        }

        this.reservationStatus = ReservationStatus.READY;
    }

    public void completed() {
        if (this.reservationStatus != ReservationStatus.READY) {
            throw new IllegalStateException(
                "준비된 예약만 완료 처리할 수 있습니다."
        );
    }
        this.reservationStatus = ReservationStatus.COMPLETED;
    }
}
