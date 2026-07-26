package com.assetflow.reservation;

import com.assetflow.asset.AssetItem;
import com.assetflow.member.Member;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

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

    private LocalDate reservedAt;

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
        reservedAt = LocalDate.now();
    }

    public void cancel() {
        this.reservationStatus = ReservationStatus.CANCELED;
    }

    public void ready() {
        this.reservationStatus = ReservationStatus.READY;
    }

    public void completed() {
        this.reservationStatus = ReservationStatus.COMPLETED;
    }
}
