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
  padding: 45px 0 30px;
  margin-top: 60px;
}

.footer-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 30px;
}

.footer-row-1 {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 60px;
  padding-bottom: 38px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 30px;
}

.footer-row-2 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 45px;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.contact-section {
  gap: 18px;
}

.newsletter-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.newsletter-right {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
  align-items: start;
}

.footer-title {
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 0;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.contact-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: 10.5px;
}

.contact-icon {
  font-size: 18px;
  line-height: 1;
}

.contact-label {
  font-weight: 700;
  font-size: 10.5px;
  margin-bottom: 3px;
}

.contact-value {
  font-size: 10.5px;
  opacity: 0.9;
  line-height: 1.5;
}

.social-links {
  display: flex;
  gap: 11px;
  margin-top: 6px;
}

.social-icon {
  width: 31px;
  height: 31px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-decoration: none;
  font-weight: bold;
  transition: transform 0.3s, opacity 0.3s;
  font-size: 15px;
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
  gap: 9px;
  margin: 0;
  padding: 0;
}

.footer-links a {
  color: #fff;
  text-decoration: none;
  font-size: 10.5px;
  transition: opacity 0.3s;
  opacity: 0.9;
  line-height: 1.6;
}

.footer-links a:hover {
  opacity: 1;
}

.newsletter-form {
  display: flex;
  gap: 18px;
}

.newsletter-input {
  flex: 1;
  padding: 10.5px 13.5px;
  border: none;
  border-radius: 4.5px;
  font-size: 10.5px;
  outline: none;
  font-family: inherit;
  width: 450px;
}

.newsletter-btn {
  padding: 10.5px 24px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4.5px;
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.3s, transform 0.3s;
  white-space: nowrap;
  width: 121px;
}

.newsletter-btn:hover {
  background: #333;
  transform: translateY(-2px);
}

.footer-box {
  background: rgba(0, 0, 0, 0.2);
  padding: 16.5px;
  border-radius: 6px;
  width: 450px;

}

.box-title {
  font-size: 11px;
  font-weight: 800;
  margin-bottom: 9px;
  letter-spacing: 0.5px;
}

.box-text {
  font-size: 9.75px;
  line-height: 1.7;
  opacity: 0.9;
  margin-bottom: 9px;
}

.box-link {
  color: #fff;
  font-size: 9.75px;
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
  width: 121px;
  height: 129px;
  background: #fff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a70d29;
  font-weight: 800;
  font-size: 15px;
  box-shadow: 0 3px 9px rgba(0, 0, 0, 0.2);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .footer-container {
    padding: 0 30px;
  }

  .footer-row-1 {
    gap: 60px;
  }

  .newsletter-right {
    gap: 20px;
  }
}

@media (max-width: 992px) {
  .footer {
    padding: 50px 0 35px;
    margin-top: 60px;
  }

  .footer-row-1 {
    grid-template-columns: 1fr;
    gap: 40px;
    padding-bottom: 40px;
    margin-bottom: 35px;
  }

  .footer-row-2 {
    grid-template-columns: 1fr;
    gap: 35px;
  }

  .footer-box {
    width: 100%;
  }

  .newsletter-form {
    flex-direction: column;
    gap: 15px;
  }

  .newsletter-input {
    width: 100%;
  }

  .newsletter-btn {
    width: 100%;
  }

  .newsletter-right {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .qr-code {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 40px 0 30px;
    margin-top: 50px;
  }

  .footer-container {
    padding: 0 20px;
  }

  .footer-row-1 {
    padding-bottom: 35px;
    margin-bottom: 30px;
  }

  .footer-row-2 {
    gap: 30px;
  }

  .footer-title {
    font-size: 14px;
  }

  .contact-icon {
    font-size: 20px;
  }

  .contact-label,
  .contact-value,
  .footer-links a {
    font-size: 13px;
  }

  .social-icon {
    width: 38px;
    height: 38px;
    font-size: 18px;
  }

  .box-title {
    font-size: 14px;
  }

  .box-text,
  .box-link {
    font-size: 12px;
  }

  .newsletter-input {
    padding: 12px 16px;
    font-size: 13px;
  }

  .newsletter-btn {
    padding: 12px 28px;
    font-size: 13px;
  }

  .qr-placeholder {
    width: 140px;
    height: 140px;
  }
}

@media (max-width: 480px) {
  .footer {
    padding: 30px 0 25px;
    margin-top: 40px;
  }

  .footer-container {
    padding: 0 15px;
  }

  .footer-row-1 {
    gap: 30px;
    padding-bottom: 30px;
    margin-bottom: 25px;
  }

  .footer-row-2 {
    gap: 25px;
  }

  .footer-title {
    font-size: 13px;
    margin-bottom: 15px;
  }

  .contact-section {
    gap: 20px;
  }

  .contact-item {
    gap: 12px;
  }

  .contact-icon {
    font-size: 18px;
  }

  .contact-label,
  .contact-value {
    font-size: 12px;
  }

  .social-links {
    gap: 12px;
    margin-top: 5px;
  }

  .social-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .footer-box {
    padding: 18px;
  }

  .box-title {
    font-size: 13px;
    margin-bottom: 10px;
  }

  .box-text {
    font-size: 11px;
    line-height: 1.6;
    margin-bottom: 10px;
  }

  .box-link {
    font-size: 11px;
  }

  .newsletter-input {
    padding: 11px 14px;
    font-size: 12px;
  }

  .newsletter-btn {
    padding: 11px 24px;
    font-size: 12px;
  }

  .qr-placeholder {
    width: 120px;
    height: 120px;
    font-size: 16px;
  }

  .footer-links {
    gap: 10px;
  }

  .footer-links a {
    font-size: 12px;
  }
}
</style>
