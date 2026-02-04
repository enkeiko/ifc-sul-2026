// ============================================
// Google Apps Script - Google Sheets 주문/콘텐츠 저장
// ============================================
//
// [설정 방법]
// 1. Google Drive에서 새 Google Sheets 생성
// 2. 시트1(주문) 첫 행 헤더:
//    A1: 접수일시 | B1: 이름 | C1: 연락처 | D1: 상품 | E1: 수령방법 | F1: 요청사항 | G1: 주문액
// 3. 시트2 이름을 "콘텐츠"로 변경, 첫 행 헤더:
//    A1: 접수일시 | B1: 상호명 | C1: 전체데이터(JSON)
// 4. 메뉴 > 확장 프로그램 > Apps Script 클릭
// 5. 아래 코드를 붙여넣기
// 6. 배포 > 새 배포 > 웹 앱 선택
//    - 실행 사용자: 나
//    - 액세스 권한: 모든 사용자
// 7. 배포 후 나오는 URL을 order.html, content-form.html에 입력
// ============================================

function doPost(e) {
  try {
    var jsonData = e.parameter.data;
    var data = JSON.parse(jsonData);

    var now = new Date();
    var kst = Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

    // 콘텐츠 양식인 경우
    if (data.formType === 'content') {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var contentSheet = ss.getSheetByName('콘텐츠');

      // "콘텐츠" 시트가 없으면 자동 생성
      if (!contentSheet) {
        contentSheet = ss.insertSheet('콘텐츠');
        contentSheet.appendRow(['접수일시', '상호명', '전체데이터(JSON)']);
      }

      // 상호명 추출
      var storeName = '';
      var storeInfo = data['1. 매장 기본 정보'];
      if (storeInfo && storeInfo['상호명']) {
        storeName = storeInfo['상호명'];
      }

      contentSheet.appendRow([kst, storeName, jsonData]);

      return ContentService.createTextOutput('success');
    }

    // 주문 양식인 경우 (기존 로직)
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    var products = '';
    if (data.products && data.products.length > 0) {
      products = data.products.map(function(p) {
        return p.name + ' x ' + p.qty;
      }).join(', ');
    } else {
      products = '(선택 안함)';
    }

    var totalAmount = data.totalAmount ? data.totalAmount.toLocaleString() + '원' : '';

    sheet.appendRow([
      kst,
      data.name,
      data.phone,
      products,
      data.delivery,
      data.message || '',
      totalAmount
    ]);

    return ContentService.createTextOutput('success');

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'OK', message: 'IFC Sul Order API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}
