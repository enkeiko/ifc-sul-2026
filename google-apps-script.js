// ============================================
// Google Apps Script - Google Sheets 주문 저장
// ============================================
//
// [설정 방법]
// 1. Google Drive에서 새 Google Sheets 생성
// 2. 시트 첫 행에 헤더 입력:
//    A1: 접수일시 | B1: 신청유형 | C1: 이름 | D1: 연락처 | E1: 상품 | F1: 수령방법 | G1: 요청사항
// 3. 메뉴 > 확장 프로그램 > Apps Script 클릭
// 4. 아래 코드를 붙여넣기
// 5. 배포 > 새 배포 > 웹 앱 선택
//    - 설명: 주문 접수
//    - 실행 사용자: 나
//    - 액세스 권한: 모든 사용자
// 6. 배포 후 나오는 URL을 order.html에 입력
// ============================================

function doPost(e) {
  try {
    // 스프레드시트 연결 (활성 시트 사용)
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // POST 데이터 파싱
    var data = JSON.parse(e.postData.contents);

    // 상품 정보 포맷팅
    var products = '';
    if (data.products && data.products.length > 0) {
      products = data.products.map(function(p) {
        return p.name + ' x ' + p.qty;
      }).join(', ');
    } else {
      products = '(선택 안함)';
    }

    // 현재 시간 (KST)
    var now = new Date();
    var kst = Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

    // 시트에 행 추가
    sheet.appendRow([
      kst,           // 접수일시
      data.type,     // 신청유형
      data.name,     // 이름
      data.phone,    // 연락처
      products,      // 상품
      data.delivery, // 수령방법
      data.message || ''  // 요청사항
    ]);

    // 성공 응답
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // 에러 응답
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// CORS 처리를 위한 doGet (테스트용)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'OK', message: 'IFC Sul Order API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}
