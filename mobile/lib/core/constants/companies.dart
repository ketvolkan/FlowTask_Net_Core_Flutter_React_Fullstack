class Company {
  final String id;
  final String code;
  final String name;
  final String shortName;
  final String description;
  final String color;
  final List<String> defaultDepartments;

  const Company({
    required this.id,
    required this.code,
    required this.name,
    required this.shortName,
    required this.description,
    required this.color,
    required this.defaultDepartments,
  });
}

class AppCompanies {
  static const List<Company> list = [
    Company(
      id: 'techflow',
      code: 'TF',
      name: 'TechFlow Solutions A.Ş.',
      shortName: 'TechFlow',
      description: 'Yazılım & Bulut Bilişim Çözümleri',
      color: '#4F46E5',
      defaultDepartments: [
        'Yazılım Geliştirme (Frontend & Backend)',
        'DevOps & Bulut Altyapı',
        'Mobil Uygulama Geliştirme',
        'Kalite Güvence & Test Otomasyonu (QA)',
        'Ürün & Proje Yönetimi',
      ],
    ),
    Company(
      id: 'acmeglobal',
      code: 'AG',
      name: 'Acme Global Corp.',
      shortName: 'Acme Global',
      description: 'E-Ticaret & Tedarik Zinciri Yönetimi',
      color: '#0284C7',
      defaultDepartments: [
        'E-Ticaret & Pazaryeri Operasyonları',
        'Tedarik Zinciri & Lojistik',
        'Dijital Pazarlama & Büyüme (Growth)',
        'Müşteri Deneyimi (CX) & Destek',
        'Finans & Muhasebe',
      ],
    ),
    Company(
      id: 'nexusfin',
      code: 'NF',
      name: 'Nexus FinTech Systems',
      shortName: 'Nexus FinTech',
      description: 'Yeni Nesil Dijital Bankacılık & Ödeme',
      color: '#059669',
      defaultDepartments: [
        'Çekirdek Bankacılık & POS Sistemleri',
        'Güvenlik & Uyum (Compliance & AML)',
        'Risk & Fraud Analitiği',
        'Açık Bankacılık (Open Banking) API Ekibi',
        'Kripto & Dijital Varlıklar',
      ],
    ),
    Company(
      id: 'pulsehealth',
      code: 'PH',
      name: 'Pulse HealthTech AI',
      shortName: 'Pulse HealthTech',
      description: 'Medikal Yapay Zeka & Tele-Sağlık',
      color: '#E11D48',
      defaultDepartments: [
        'Klinik Yapay Zeka & NLP',
        'Tele-Tıp Platformu & Mobil Sağlık',
        'Biyomedikal Görüntü İşleme',
        'Hasta Veri Güvenliği (HIPAA/KVKK)',
        'e-Reçete & Entegrasyon (HL7/FHIR)',
      ],
    ),
    Company(
      id: 'vortexlog',
      code: 'VL',
      name: 'Vortex Logistics Global',
      shortName: 'Vortex Logistics',
      description: 'Otonom Filo & Akıllı Depo Dağıtım',
      color: '#D97706',
      defaultDepartments: [
        'Akıllı Rota & Navigasyon Sistemleri',
        'IoT & Filo Telemetri Takibi',
        'Depo Otomasyonu & Robotik',
        'Gümrük & Uluslararası Taşıma',
        'Soğuk Zincir İzleme',
      ],
    ),
  ];

  static Company? getCompanyForUser(String email, String? department, String? jobTitle) {
    final lowerEmail = email.toLowerCase();
    final lowerDept = (department ?? '').toLowerCase();
    final lowerTitle = (jobTitle ?? '').toLowerCase();

    if (lowerEmail.contains('techflow') || lowerDept.contains('techflow') || lowerTitle.contains('techflow')) {
      return list[0];
    }
    if (lowerEmail.contains('acme') || lowerDept.contains('acme') || lowerTitle.contains('acme')) {
      return list[1];
    }
    if (lowerEmail.contains('nexus') || lowerDept.contains('nexus') || lowerTitle.contains('nexus')) {
      return list[2];
    }
    if (lowerEmail.contains('pulse') || lowerDept.contains('pulse') || lowerTitle.contains('pulse')) {
      return list[3];
    }
    if (lowerEmail.contains('vortex') || lowerDept.contains('vortex') || lowerTitle.contains('vortex')) {
      return list[4];
    }
    return list[0];
  }
}
