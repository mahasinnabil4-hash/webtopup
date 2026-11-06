import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan - NEXATOPUP',
  description: 'Syarat dan ketentuan penggunaan layanan NEXATOPUP untuk top-up game online.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-slate-50 mb-2">Syarat & Ketentuan</h1>
            <p className="text-slate-400">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <div className="mt-10 space-y-8 prose prose-invert max-w-none">
              <section>
                <h2 className="text-2xl font-semibold text-slate-50 mb-4">1. Penerimaan Syarat</h2>
                <p className="text-slate-400 leading-relaxed">
                  Dengan mengakses dan menggunakan layanan NEXATOPUP, Anda setuju terikat oleh syarat dan ketentuan ini.
                  Jika tidak setuju, harap tidak menggunakan layanan kami.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-50 mb-4">2. Layanan Top-Up</h2>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>NEXATOPUP menyediakan layanan top-up item game virtual (diamond, UC, coins, dll)</li>
                  <li>Harga dan ketersediaan produk dapat berubah tanpa pemberitahuan sebelumnya</li>
                  <li>Kami tidak menjamin ketersediaan 100% setiap saat karena ketergantungan pada supplier</li>
                  <li>Pengiriman item dilakukan oleh supplier pihak ketiga setelah pembayaran terverifikasi</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-50 mb-4">3. Pesanan & Pembayaran</h2>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>Pesanan dibuat saat Anda melengkapi form dan memilih metode pembayaran</li>
                  <li>Pembayaran harus diselesaikan dalam waktu yang ditentukan (biasanya 24 jam)</li>
                  <li>Pesanan kedaluwarsa akan otomatis dibatalkan</li>
                  <li>Total pembayaran sudah termasuk biaya layanan payment gateway</li>
                  <li>Kami tidak menyimpan data kartu kredit atau PIN e-wallet</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-50 mb-4">4. Proses Top-Up & Waktu Pengiriman</h2>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>Proses otomatis biasanya selesai dalam hitungan menit hingga 1 jam</li>
                  <li>Proses manual (jika supplier down) dapat memakan waktu hingga 24 jam</li>
                  <li>Waktu pengiriman tidak terikat SLA ketat karena ketergantungan eksternal</li>
                  <li>Kami akan berusaha sebaik mungkin untuk menyelesaikan pesanan tercepat</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-50 mb-4">5. Kebijakan Refund & Gagal</h2>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>Refund otomatis jika pembayaran berhasil tapi top-up gagal total (setelah verifikasi)</li>
                  <li>Tidak ada refund untuk kesalahan input User ID/Zone ID oleh pelanggan</li>
                  <li>Klaim gagal harus dilaporkan maksimal 3 hari setelah pembayaran</li>
                  <li>Proses refund ke sumber pembayaran asli (5-14 hari kerja tergantung bank/e-wallet)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-50 mb-4">6. Tanggung Jawab Pelanggan</h2>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>Memastikan User ID, Zone ID, dan Server benar sebelum memesan</li>
                  <li>Menyediakan informasi kontak yang valid (email/telepon)</li>
                  <li>Tidak menggunakan layanan untuk aktivitas ilegal atau penipuan</li>
                  <li>Bertanggung jawab penuh atas keamanan akun game sendiri</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-50 mb-4">7. Batasan Tanggung Jawab</h2>
                <p className="text-slate-400 leading-relaxed">
                  NEXATOPUP tidak bertanggung jawab atas: kerugian akibat force majeure, gangguan server game/supplier,
                  kesalahan input pelanggan, penipuan oleh pihak mengaku dari NEXATOPUP, atau kerugian tidak langsung.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-50 mb-4">8. Perubahan Syarat</h2>
                <p className="text-slate-400 leading-relaxed">
                  Kami berhak mengubah syarat ini kapan saja. Perubahan berlaku efektif setelah dipublikasikan di halaman ini.
                  Penggunaan berkelanjutan berarti Anda menerima perubahan tersebut.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-50 mb-4">9. Hukum Berlaku & Yurisdiksi</h2>
                <p className="text-slate-400 leading-relaxed">
                  Syarat ini diatur oleh hukum Republik Indonesia. Sengketa diselesaikan melalui musyawarah,
                  atau pengadilan negeri yang berwenang di Jakarta.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-50 mb-4">10. Kontak</h2>
                <p className="text-slate-400 leading-relaxed">
                  Pertanyaan tentang syarat & ketentuan: <a href="mailto:legal@nexatopup.com" className="text-purple-400 hover:underline">legal@nexatopup.com</a>
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}