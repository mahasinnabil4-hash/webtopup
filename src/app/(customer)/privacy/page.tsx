import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi - NEXATOPUP',
  description: 'Kebijakan privasi NEXATOPUP mengenai pengumpulan, penggunaan, dan perlindungan data pribadi pengguna.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-slate-50 mb-2">Kebijakan Privasi</h1>
            <p className="text-slate-400">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <div className="mt-10 space-y-8 prose prose-invert max-w-none">
              <section>
                <h2 className="text-2xl font-semibold text-slate-50 mb-4">1. Pengumpulan Data</h2>
                <p className="text-slate-400 leading-relaxed">
                  Kami mengumpulkan data pribadi yang Anda berikan saat mendaftar, memesan, atau menghubungi kami.
                  Data meliputi: nama lengkap, alamat email, nomor telepon, User ID game, Zone ID, dan riwayat transaksi.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-50 mb-4">2. Penggunaan Data</h2>
                <p className="text-slate-400 leading-relaxed">
                  Data Anda digunakan untuk: memproses pesanan top-up, mengirim notifikasi status, komunikasi support,
                  penagihan, pencegahan penipuan, dan peningkatan layanan. Kami tidak menjual data Anda ke pihak ketiga.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-50 mb-4">3. Berbagi Data</h2>
                <p className="text-slate-400 leading-relaxed">
                  Data dapat dibagi dengan: payment gateway (Midtrans/Xendit) untuk proses pembayaran, supplier top-up
                  untuk memproses pengiriman item, dan pihak berwajib jika diperlukan oleh hukum.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-50 mb-4">4. Keamanan Data</h2>
                <p className="text-slate-400 leading-relaxed">
                  Kami menerapkan enkripsi TLS 1.2+, hashing password dengan bcrypt, dan akses terbatas.
                  Data kartu kredit tidak pernah disimpan di server kami.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-50 mb-4">5. Hak Anda</h2>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>Mengakses dan memperbaiki data pribadi</li>
                  <li>Meminta penghapusan data (right to be forgotten)</li>
                  <li>Membatasi pemrosesan data</li>
                  <li>Portabilitas data</li>
                  <li>Mengajukan keluhan ke otoritas pengawas</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-50 mb-4">6. Cookie & Tracking</h2>
                <p className="text-slate-400 leading-relaxed">
                  Situs ini menggunakan cookie esensial untuk sesi login, keranjang, dan keamanan.
                  Kami tidak menggunakan cookie pemasaran pihak ketiga tanpa persetujuan.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-50 mb-4">7. Kontak</h2>
                <p className="text-slate-400 leading-relaxed">
                  Untuk pertanyaan tentang kebijakan privasi, hubungi kami di
                  <a href="mailto:privacy@nexatopup.com" className="text-purple-400 hover:underline">privacy@nexatopup.com</a>
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