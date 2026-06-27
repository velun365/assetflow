package com.assetflow.loan.service;

import com.assetflow.asset.*;
import com.assetflow.asset.repository.AssetItemRepository;
import com.assetflow.asset.repository.AssetRepository;
import com.assetflow.asset.repository.CategoryRepository;
import com.assetflow.loan.LoanStatus;
import com.assetflow.loan.dto.*;
import com.assetflow.loan.repository.LoanRepository;
import com.assetflow.member.Member;
import com.assetflow.member.repository.MemberRepository;
import com.assetflow.reservation.repository.ReservationRepository;
import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootTest
@Slf4j
@Transactional

class LoanServiceTest {
    @Autowired
    MemberRepository memberRepository;
    @Autowired
    CategoryRepository categoryRepository;
    @Autowired
    AssetRepository assetRepository;

    @Autowired
    AssetItemRepository assetItemRepository;

    @Autowired
    LoanService loanService;


    @Test
    void createLoan() {
        //given
        TestData data = testReady();
        LoanCreateRequest request = new LoanCreateRequest(
                data.member1.getId(),
                data.assetItem1.getId()
        );

        //when
        LoanCreateResponse response = loanService.createLoan(request);

        //then
        Assertions.assertThat(response.getLoanStatus()).isEqualTo(LoanStatus.RENTED);
        Assertions.assertThat(data.assetItem1.getAssetItemStatus()).isEqualTo(AssetItemStatus.RENTED);

    }

    @Test
    void returnLoan() {
        //given
        TestData data = testReady();
        LoanCreateRequest request = new LoanCreateRequest(
                data.member1.getId(),
                data.assetItem1.getId()
        );
        //when
        LoanCreateResponse loan = loanService.createLoan(request);
        LoanReturnResponse response = loanService.returnLoan(loan.getLoanId());

        //then
        Assertions.assertThat(response.getLoanStatus()).isEqualTo(LoanStatus.RETURNED);
        Assertions.assertThat(data.assetItem1.getAssetItemStatus()).isEqualTo(AssetItemStatus.AVAILABLE);
    }

    @Test
    void listAll() {
        TestData data = testReady();
        LoanCreateRequest request1 = new LoanCreateRequest(
                data.member1.getId(),
                data.assetItem1.getId()
        );
        LoanCreateRequest request2 = new LoanCreateRequest(
                data.member2.getId(),
                data.assetItem2.getId()
        );
        loanService.createLoan(request1);
        loanService.createLoan(request2);

        List<LoanListResponse> response = loanService.listAll();

        Assertions.assertThat(response).hasSize(2);
        Assertions.assertThat(response.get(0).getLoanStatus())
                .isEqualTo(LoanStatus.RENTED);
        Assertions.assertThat(response.get(1).getLoanStatus())
                .isEqualTo(LoanStatus.RENTED);
    }

    @Test
    void findLoansByMember() {
        TestData data = testReady();
        LoanCreateRequest request1 = new LoanCreateRequest(
                data.member1.getId(),
                data.assetItem1.getId()
        );
        LoanCreateRequest request2 = new LoanCreateRequest(
                data.member2.getId(),
                data.assetItem2.getId()
        );
        loanService.createLoan(request1);
        loanService.createLoan(request2);

        List<MyLoanListResponse> response = loanService.findLoansByMember(data.member1.getId());

        Assertions.assertThat(response).hasSize(1);
        Assertions.assertThat(response.get(0).getAssetItemId()).isEqualTo(data.assetItem1.getId());
        Assertions.assertThat(response.get(0).getLoanStatus()).isEqualTo(LoanStatus.RENTED);

    }

    @Test
    void updateOverdueLoan() {
    }


    private TestData testReady() {
        Member member1 = new Member(
                "test01",
                "test01@naver.com",
                "test123456",
                "김철수"
        );
        Member member2 = new Member(
                "test02",
                "test02@naver.com",
                "test123456",
                "신짱구"
        );
        Category category1 = new Category(
                "전자기기"
        );
        Category category2 = new Category(
                "도서"
        );

        Asset asset1 = new Asset(
                "삼성",
                "이것은 갤럭시 핸드폰입니다.",
                AssetType.DEVICE
        );
        asset1.changeCategory(category1);
        Asset asset2 = new Asset(
                "애플",
                "이것은 애플 핸드폰입니다.",
                AssetType.DEVICE
        );
        asset2.changeCategory(category1);

        AssetItem assetItem1 = new AssetItem(
                "SM-510",
                "1층 전산실",
                asset1
        );

        AssetItem assetItem2 = new AssetItem(
                "SM-520",
                "2층 전산실",
                asset2
        );
        memberRepository.save(member1);
        memberRepository.save(member2);
        categoryRepository.save(category1);
        categoryRepository.save(category2);
        assetRepository.save(asset1);
        assetItemRepository.save(assetItem1);
        assetRepository.save(asset2);
        assetItemRepository.save(assetItem2);

        return new TestData(member1, member2, assetItem1, assetItem2);
    }

    private static class TestData {
        Member member1;
        Member member2;
        AssetItem assetItem1;
        AssetItem assetItem2;

        TestData(Member member1, Member member2, AssetItem assetItem1, AssetItem assetItem2) {
            this.member1 = member1;
            this.member2 = member2;
            this.assetItem1 = assetItem1;
            this.assetItem2 = assetItem2;
        }
    }
}
