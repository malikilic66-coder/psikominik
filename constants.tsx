import { 
  Baby, 
  Brain, 
  Users, 
  Heart, 
  Activity, 
  Smile, 
  Sun,
  BookOpen
} from 'lucide-react';
import { NavItem, Service, TeamMember, Testimonial, FAQ } from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Anasayfa', path: '/' },
  { label: 'Hakkımızda', path: '/about' },
  { label: 'Hizmetler', path: '/services' },
  { label: 'Ebeveyn Akademisi', path: '/academy' },
  { label: 'İletişim', path: '/contact' },
];

export const SERVICES: Service[] = [
  {
    id: 'playgroups',
    title: 'Oyun Grupları',
    shortDescription: '0-3 yaş arası çocuklar için gelişim odaklı, uzman eşliğinde oyun grupları.',
    fullDescription: 'Çocukların sosyal ve motor becerilerini destekleyen, yapılandırılmış oyun saatleri.',
    icon: Users,
    color: 'bg-psiko-teal',
    features: ['Kaşifler (12-18 Ay)', 'Mucitler (18-24 Ay)', 'Yaratıcılar (24-36 Ay)']
  },
  {
    id: 'play-therapy',
    title: 'Oyun Terapisi',
    shortDescription: 'Çocukların duygusal dünyasını anlamak ve iyileştirmek için terapötik yaklaşım.',
    fullDescription: 'Çocuğun iç dünyasını oyun yoluyla ifade etmesine olanak tanıyan bilimsel bir yöntem.',
    icon: Brain,
    color: 'bg-soft-coral',
    features: ['Duygusal Regülasyon', 'Travma Çalışması', 'Özgüven Gelişimi']
  },
  {
    id: 'filial-therapy',
    title: 'Filial Terapi',
    shortDescription: 'Ebeveyn ve çocuk arasındaki bağı güçlendiren aile odaklı terapi modeli.',
    fullDescription: 'Ebeveynlerin terapist rehberliğinde çocuklarıyla özel oyun oturumları düzenlemesini sağlayan güçlendirici bir yaklaşım.',
    icon: Heart,
    color: 'bg-sage-green',
    features: ['Güvenli Bağlanma', 'Sınır Koyma', 'Ebeveyn Koçluğu']
  },
  {
    id: 'development',
    title: 'Gelişim Takibi',
    shortDescription: 'Denver II ve AGTE gibi uluslararası testlerle gelişimsel tarama.',
    fullDescription: 'Çocuğunuzun gelişim basamaklarını bilimsel verilerle takip ediyoruz.',
    icon: Activity,
    color: 'bg-sun-yellow',
    features: ['Denver II Testi', 'AGTE', 'Gözlem Raporları']
  }
];

export const TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'Uzm. Psk. Melis Yılmaz',
    role: 'Kurucu & Oyun Terapisti',
    image: 'https://picsum.photos/seed/melis/300/300',
    credentials: ['ODTÜ Psikoloji Lisans', 'Klinik Psikoloji Yüksek Lisans', 'Deneyimsel Oyun Terapisi']
  },
  {
    id: '2',
    name: 'Seda Demir',
    role: 'Çocuk Gelişim Uzmanı',
    image: 'https://picsum.photos/seed/seda/300/300',
    credentials: ['Hacettepe Çocuk Gelişimi', 'Duyu Bütünleme Eğitimi', 'Montessori Eğitmenliği']
  },
  {
    id: '3',
    name: 'Psk. Caner Öztürk',
    role: 'Aile Danışmanı',
    image: 'https://picsum.photos/seed/caner/300/300',
    credentials: ['İstanbul Üniversitesi Psikoloji', 'Aile Danışmanlığı Sertifikası', 'Filial Terapi Uygulayıcısı']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    text: "Oğlumdaki öfke nöbetleri için başvurduk. Filial terapi sayesinde evdeki huzurumuz geri geldi. İyi ki varsınız!",
    author: "Zeynep K.",
    childAge: "4 Yaş Annesi"
  },
  {
    id: '2',
    text: "Oyun grupları sadece oyun değil, resmen bir okul gibi ama çok daha eğlenceli. Gelişim raporları çok detaylı.",
    author: "Murat A.",
    childAge: "2.5 Yaş Babası"
  },
  {
    id: '3',
    text: "Kaygılı bir anne olarak kapıdan girdiğim an rahatladım. Hijyen ve uzman yaklaşımı mükemmel.",
    author: "Elif S.",
    childAge: "18 Ay Annesi"
  }
];

export const FAQS: FAQ[] = [
  {
    question: "Oyun gruplarında ebeveyn katılımı zorunlu mu?",
    answer: "12-24 ay gruplarımız ebeveynli (veya bakım verenli) olarak yürütülmektedir. 24 ay sonrasında kademeli olarak bağımsız gruplara geçiş yapılmaktadır."
  },
  {
    question: "Hangi gelişim testlerini uyguluyorsunuz?",
    answer: "Kurumumuzda Denver II Gelişimsel Tarama Testi, AGTE (Ankara Gelişim Tarama Envanteri) ve Metropolitan Okul Olgunluğu testleri uygulanmaktadır."
  },
  {
    question: "Deneme dersiniz var mı?",
    answer: "Evet, ailelerimizin ortamı görmesi ve çocuğun uyumunu gözlemlemek için ücretsiz bir tanışma randevusu ve deneme saati sunuyoruz."
  }
];
