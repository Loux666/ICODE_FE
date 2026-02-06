<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- Row 1 -->
      <div class="footer-row-1">
        <div class="footer-section contact-section">
          <h3 class="footer-title">THÔNG TIN LIÊN HỆ</h3>
          <div class="contact-item">
            <span class="contact-icon">📞</span>
            <div>
              <div class="contact-label">Hotline</div>
              <div class="contact-value">0868252839</div>
            </div>
          </div>
          <div class="contact-item">
            <span class="contact-icon">✉️</span>
            <div>
              <div class="contact-label">Email</div>
              <div class="contact-value">ryastore@gmail.com</div>
            </div>
          </div>
          <div class="contact-item">
            <span class="contact-icon">📍</span>
            <div>
              <div class="contact-label">Địa chỉ</div>
              <div class="contact-value">262B Nguyễn Trãi, Thanh Xuân, Hà Nội</div>
            </div>
          </div>
          <div class="social-links">
            <a href="#" class="social-icon facebook">f</a>
            <a href="#" class="social-icon instagram">📷</a>
            <a href="#" class="social-icon tiktok">🎵</a>
          </div>
        </div>

        <div class="footer-section newsletter-section">
          <h3 class="footer-title">ĐĂNG KÍ NHẬN THÔNG TIN</h3>
          <div class="newsletter-form">
            <input
              type="email"
              placeholder="Nhập địa chỉ email"
              class="newsletter-input"
              v-model="email"
            />
            <button class="newsletter-btn" @click="subscribe">Đăng ký</button>
          </div>

          <div class="newsletter-right">
            <div class="footer-box">
              <h4 class="box-title">HỘP THƯ GÓP Ý</h4>
              <p class="box-text">
                Hãy để lại ý kiến đóng góp, đánh giá để giúp chúng tôi phát
                triển và nâng cao trải nghiệm dịch vụ bạn nhé!
              </p>
              <a href="#" class="box-link">› Gửi lời nhắn ngay</a>
            </div>
            <div class="qr-code">
              <img class="qr-placeholder" src="@/assets/qr.png" alt="QR"></img>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 2 -->
      <div class="footer-row-2">
        <div class="footer-section">
          <h3 class="footer-title">HỖ TRỢ KHÁCH HÀNG</h3>
          <ul class="footer-links">
            <li><a href="#">Hướng dẫn đặt hàng</a></li>
            <li><a href="#">Phương thức thanh toán</a></li>
            <li><a href="#">Hỏi đáp - FAQs</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h3 class="footer-title">CHÍNH SÁCH</h3>
          <ul class="footer-links">
            <li><a href="#">Chính sách đổi trả tại cửa hàng</a></li>
            <li><a href="#">Chính sách đổi trả online</a></li>
            <li><a href="#">Chính sách vận chuyển</a></li>
            <li><a href="#">Chính sách kiểm hàng</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
            <li><a href="#">Điều khoản dịch vụ</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h3 class="footer-title">VỀ RYA'S STORE</h3>
          <ul class="footer-links">
            <li><a href="#">Chúng tôi là ai</a></li>
            <li><a href="#">Cam kết của chúng tôi</a></li>
            <li><a href="#">Tin tuyển dụng</a></li>
            <li><a href="#">Hệ thống cửa hàng</a></li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "Footer",
  data() {
    return {
      email: "",
    };
  },
  methods: {
    subscribe() {
      if (this.email) {
        console.log("Đăng ký email:", this.email);
        // Xử lý đăng ký newsletter ở đây
        alert("Đăng ký thành công!");
        this.email = "";
      }
    },
  },
};
</script>

<style scoped>
.footer {
  background: #a70d29;
  color: #fff;
  padding: 60px 0 40px;
  margin-top: 80px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.footer-row-1 {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 80px;
  padding-bottom: 50px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 40px;
}

.footer-row-2 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 60px;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contact-section {
  gap: 24px;
}

.newsletter-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.newsletter-right {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  align-items: start;
}

.footer-title {
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 0;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.contact-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  font-size: 14px;
}

.contact-icon {
  font-size: 24px;
  line-height: 1;
}

.contact-label {
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 4px;
}

.contact-value {
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.5;
}

.social-links {
  display: flex;
  gap: 15px;
  margin-top: 8px;
}

.social-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-decoration: none;
  font-weight: bold;
  transition: transform 0.3s, opacity 0.3s;
  font-size: 20px;
}

.social-icon.facebook {
  background: #1877f2;
}

.social-icon.instagram {
  background: linear-gradient(
    45deg,
    #f09433 0%,
    #e6683c 25%,
    #dc2743 50%,
    #cc2366 75%,
    #bc1888 100%
  );
}

.social-icon.tiktok {
  background: #000;
}

.social-icon:hover {
  transform: scale(1.1);
  opacity: 0.9;
}

.footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
}

.footer-links a {
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  transition: opacity 0.3s;
  opacity: 0.9;
  line-height: 1.6;
}

.footer-links a:hover {
  opacity: 1;
}

.newsletter-form {
  display: flex;
  gap: 24px;
}

.newsletter-input {
  flex: 1;
  padding: 14px 18px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
  width: 600px;
}

.newsletter-btn {
  padding: 14px 32px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.3s, transform 0.3s;
  white-space: nowrap;
  width: 162px;
}

.newsletter-btn:hover {
  background: #333;
  transform: translateY(-2px);
}

.footer-box {
  background: rgba(0, 0, 0, 0.2);
  padding: 22px;
  border-radius: 8px;
  width: 600px;

}

.box-title {
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.box-text {
  font-size: 13px;
  line-height: 1.7;
  opacity: 0.9;
  margin-bottom: 12px;
}

.box-link {
  color: #fff;
  font-size: 13px;
  text-decoration: none;
  font-weight: 700;
  transition: opacity 0.3s;
}

.box-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.qr-code {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.qr-placeholder {
  width: 162px;
  height: 172px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a70d29;
  font-weight: 800;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>