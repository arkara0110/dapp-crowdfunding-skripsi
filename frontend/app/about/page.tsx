// File: frontend/app/about/page.tsx

export default function AboutPage() {
  return (
    <main className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-slate-800/50 p-8 rounded-lg border border-white/10 mt-8">
        <h1 className="text-4xl font-bold text-cyan-400 mb-6">
          Tentang Yayasan Harapan Mulia
        </h1>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <p>
            Yayasan Harapan Mulia adalah sebuah organisasi nirlaba yang
            didedikasikan untuk memberikan harapan dan menciptakan masa depan
            yang lebih cerah bagi anak-anak panti asuhan dan masyarakat kurang
            mampu. Sejak didirikan pada tahun 2010, kami percaya bahwa setiap
            individu berhak mendapatkan kesempatan yang sama untuk meraih impian
            mereka, terlepas dari latar belakang ekonomi mereka.
          </p>
          <h2 className="text-2xl font-semibold text-white border-b border-cyan-500/30 pb-2">
            Visi & Misi Kami
          </h2>
          <p>
            <strong>Visi:</strong> Menjadi jembatan kebaikan yang menghubungkan
            para dermawan dengan mereka yang paling membutuhkan, menciptakan
            ekosistem gotong royong yang berkelanjutan dan berbasis teknologi.
          </p>
          <p>
            <strong>Misi:</strong>
          </p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>
              Menyelenggarakan kampanye penggalangan dana yang transparan dan
              akuntabel menggunakan teknologi blockchain.
            </li>
            <li>
              Menyalurkan 100% donasi yang terkumpul (setelah biaya gas) kepada
              para penerima manfaat.
            </li>
            <li>
              Memberikan pendidikan dan pelatihan keterampilan untuk
              meningkatkan kemandirian anak-anak asuh kami.
            </li>
            <li>
              Membangun fasilitas yang layak dan aman bagi para penerima
              manfaat.
            </li>
          </ul>
          <p>
            Platform crowdfunding berbasis Web3 ini adalah wujud dari komitmen
            kami terhadap transparansi. Setiap rupiah (dalam bentuk ETH) yang
            Anda donasikan dapat dilacak secara terbuka di blockchain,
            memastikan bantuan Anda sampai kepada yang berhak tanpa potongan
            dari pihak ketiga. Terima kasih telah menjadi bagian dari perjalanan
            kami.
          </p>
        </div>
      </div>
    </main>
  );
}
