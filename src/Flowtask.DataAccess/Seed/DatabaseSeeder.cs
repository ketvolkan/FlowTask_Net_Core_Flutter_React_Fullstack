using Flowtask.Core.Security;
using Flowtask.DataAccess.Context;
using Flowtask.EntityLayer.Entities;
using Flowtask.EntityLayer.Enums;
using Microsoft.EntityFrameworkCore;

namespace Flowtask.DataAccess.Seed;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        // 1. Seed Permissions
        var permissions = GetPermissions();
        foreach (var perm in permissions)
        {
            if (!await context.Permissions.AnyAsync(p => p.Code == perm.Code))
            {
                await context.Permissions.AddAsync(perm);
            }
        }
        await context.SaveChangesAsync();

        // 2. Seed Roles
        var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "SystemAdmin");
        if (adminRole == null)
        {
            adminRole = new Role
            {
                Name = "SystemAdmin",
                Description = "Flowtask Platform Super Administrator",
                IsSystemRole = true
            };
            await context.Roles.AddAsync(adminRole);
            await context.SaveChangesAsync();
        }

        var userRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "User");
        if (userRole == null)
        {
            userRole = new Role
            {
                Name = "User",
                Description = "Standard Flowtask User",
                IsSystemRole = true
            };
            await context.Roles.AddAsync(userRole);
            await context.SaveChangesAsync();
        }

        // Assign all permissions to SystemAdmin
        var allDbPermissions = await context.Permissions.ToListAsync();
        foreach (var perm in allDbPermissions)
        {
            if (!await context.RolePermissions.AnyAsync(rp => rp.RoleId == adminRole.Id && rp.PermissionId == perm.Id))
            {
                await context.RolePermissions.AddAsync(new RolePermission
                {
                    RoleId = adminRole.Id,
                    PermissionId = perm.Id
                });
            }
        }
        await context.SaveChangesAsync();

        // 3. Seed Users (25+ users across 5 companies)
        var usersToSeed = new List<(string Email, string Name, string Title, string Dept, bool IsAdmin, string Password)>
        {
            // Global Multi-Company Super Users
            ("admin@flowtask.com", "Sistem Yöneticisi", "Platform SuperAdmin", "Sistem Yönetimi", true, "Admin123*"),
            ("demo@flowtask.com", "Demo Proje Yöneticisi", "Kıdemli Proje Yöneticisi", "Ürün Yönetimi", false, "Demo123*"),
            ("ayse.yilmaz@flowtask.com", "Ayşe Yılmaz", "Senior Solutions Architect & Lead Frontend", "Çoklu Şirket Danışmanlığı", false, "User123*"),
            
            // 1. TechFlow Solutions
            ("manager@techflow.com", "Ahmet Tekin", "TechFlow Kurucu & CTO", "Yönetim & Teknoloji", false, "Manager123*"),
            ("mehmet.kaya@flowtask.com", "Mehmet Kaya", "Principal Backend Engineer", "Backend Geliştirme", false, "User123*"),
            ("caner.erdogan@flowtask.com", "Caner Erdoğan", "DevOps & Cloud Specialist", "Altyapı & Güvenlik", false, "User123*"),
            ("elif.yildirim@techflow.com", "Elif Yıldırım", "Senior Frontend Developer", "Frontend Geliştirme", false, "User123*"),
            ("burak.celik@techflow.com", "Burak Çelik", "Fullstack Software Engineer", "Çekirdek Mühendislik", false, "User123*"),
            ("duygu.sen@techflow.com", "Duygu Şen", "QA & Test Automation Lead", "Kalite Güvence (QA)", false, "User123*"),

            // 2. Acme Global Corp
            ("admin@acmeglobal.com", "Burak Demir", "Acme Global Ürün Direktörü", "Üst Yönetim", false, "Manager123*"),
            ("selin.arslan@acmeglobal.com", "Selin Arslan", "E-Ticaret Operasyon Müdürü", "E-Ticaret Operasyon", false, "User123*"),
            ("kerem.yurt@acmeglobal.com", "Kerem Yurt", "Tedarik Zinciri & Lojistik Uzmanı", "Tedarik Zinciri & Depo", false, "User123*"),
            ("busra.aydin@acmeglobal.com", "Büşra Aydın", "Büyüme & Dijital Pazarlama Lideri", "Dijital Pazarlama & Büyüme", false, "User123*"),
            ("murat.dogan@acmeglobal.com", "Murat Doğan", "Ödeme Sistemleri Entegratörü", "Finans & Muhasebe", false, "User123*"),
            ("gizem.tuncer@acmeglobal.com", "Gizem Tuncer", "Müşteri Deneyimi & CX Uzmanı", "Müşteri İlişkileri (CRM)", false, "User123*"),

            // 3. Nexus FinTech Systems
            ("sinan.vural@nexusfin.com", "Sinan Vural", "FinTech Çözüm Mimarı & CTO", "Çekirdek Bankacılık & POS", false, "Manager123*"),
            ("deniz.aksoy@nexusfin.com", "Deniz Aksoy", "Fraud & Risk Analitiği Lideri", "Risk & Fraud Yönetimi", false, "User123*"),
            ("melike.guler@nexusfin.com", "Melike Güler", "Biyometrik & 3D Secure Uzmanı", "Güvenlik & Uyum (Compliance)", false, "User123*"),
            ("ozan.koc@nexusfin.com", "Ozan Koç", "Açık Bankacılık API Geliştiricisi", "Açık Bankacılık (Open Banking)", false, "User123*"),
            ("ece.bulut@nexusfin.com", "Ece Bulut", "Kripto & Blokzincir Araştırmacısı", "Kripto & Dijital Varlıklar", false, "User123*"),

            // 4. Pulse HealthTech AI
            ("hakan.ozturk@pulsehealth.com", "Dr. Hakan Öztürk", "Medikal Yapay Zeka Direktörü", "Klinik Yapay Zeka & NLP", false, "Manager123*"),
            ("zeynep.ozkan@flowtask.com", "Zeynep Özkan", "Senior UI/UX Designer & HealthTech Lead", "Tele-Tıp & Tasarım", false, "User123*"),
            ("tolga.sahin@pulsehealth.com", "Tolga Şahin", "e-Reçete & HL7/FHIR Uzmanı", "e-Sağlık & Reçete Sistemleri", false, "User123*"),
            ("asli.kara@pulsehealth.com", "Aslı Kara", "Radyoloji Görüntüleme AI Mühendisi", "Biyomedikal Görüntü İşleme", false, "User123*"),
            ("cem.akbulut@pulsehealth.com", "Cem Akbulut", "Hasta Veri Güvenliği Sorumlusu", "Hasta Veri Güvenliği (KVKK)", false, "User123*"),

            // 5. Vortex Logistics Global
            ("erdem.soylu@vortexlog.com", "Erdem Soylu", "Filo & Rota Operasyon Müdürü", "Akıllı Rota & Navigasyon", false, "Manager123*"),
            ("yasemin.cetin@vortexlog.com", "Yasemin Çetin", "IoT & Telemetri Mühendisi", "IoT & Filo Telemetri", false, "User123*"),
            ("baris.yildiz@vortexlog.com", "Barış Yıldız", "Otonom Araç Simülasyon Uzmanı", "Otonom Sürüş & Simülasyon", false, "User123*"),
            ("merve.polat@vortexlog.com", "Merve Polat", "Gümrük & Uluslararası Lojistik Koordinatörü", "Gümrük & Uluslararası Taşıma", false, "User123*"),
            ("serdar.kurt@vortexlog.com", "Serdar Kurt", "Soğuk Zincir İzleme Lideri", "Depo & Soğuk Zincir Yönetimi", false, "User123*")
        };

        var userMap = new Dictionary<string, User>();

        foreach (var u in usersToSeed)
        {
            var existing = await context.Users.FirstOrDefaultAsync(x => x.Email == u.Email);
            if (existing == null)
            {
                var newUser = new User
                {
                    FullName = u.Name,
                    Email = u.Email,
                    PasswordHash = passwordHasher.HashPassword(u.Password),
                    JobTitle = u.Title,
                    Department = u.Dept,
                    IsActive = true,
                    IsSystemAdmin = u.IsAdmin
                };
                await context.Users.AddAsync(newUser);
                await context.SaveChangesAsync();

                await context.UserRoles.AddAsync(new UserRole
                {
                    UserId = newUser.Id,
                    RoleId = u.IsAdmin ? adminRole.Id : userRole.Id
                });
                await context.SaveChangesAsync();

                userMap[u.Email] = newUser;
            }
            else
            {
                // Ensure JobTitle & Department are updated to latest realistic values
                existing.JobTitle = u.Title;
                existing.Department = u.Dept;
                existing.FullName = u.Name;
                userMap[u.Email] = existing;
            }
        }
        await context.SaveChangesAsync();

        var adminUser = userMap["admin@flowtask.com"];
        var demoUser = userMap["demo@flowtask.com"];
        var ayseUser = userMap["ayse.yilmaz@flowtask.com"];

        // TechFlow users
        var techflowManager = userMap["manager@techflow.com"];
        var mehmetUser = userMap["mehmet.kaya@flowtask.com"];
        var canerUser = userMap["caner.erdogan@flowtask.com"];
        var elifUser = userMap["elif.yildirim@techflow.com"];
        var burakCelikUser = userMap["burak.celik@techflow.com"];
        var duyguUser = userMap["duygu.sen@techflow.com"];

        // Acme users
        var acmeManager = userMap["admin@acmeglobal.com"];
        var selinUser = userMap["selin.arslan@acmeglobal.com"];
        var keremUser = userMap["kerem.yurt@acmeglobal.com"];
        var busraUser = userMap["busra.aydin@acmeglobal.com"];
        var muratUser = userMap["murat.dogan@acmeglobal.com"];
        var gizemUser = userMap["gizem.tuncer@acmeglobal.com"];

        // Nexus users
        var sinanUser = userMap["sinan.vural@nexusfin.com"];
        var denizUser = userMap["deniz.aksoy@nexusfin.com"];
        var melikeUser = userMap["melike.guler@nexusfin.com"];
        var ozanUser = userMap["ozan.koc@nexusfin.com"];
        var eceUser = userMap["ece.bulut@nexusfin.com"];

        // Pulse users
        var hakanUser = userMap["hakan.ozturk@pulsehealth.com"];
        var zeynepUser = userMap["zeynep.ozkan@flowtask.com"];
        var tolgaUser = userMap["tolga.sahin@pulsehealth.com"];
        var asliUser = userMap["asli.kara@pulsehealth.com"];
        var cemUser = userMap["cem.akbulut@pulsehealth.com"];

        // Vortex users
        var erdemUser = userMap["erdem.soylu@vortexlog.com"];
        var yaseminUser = userMap["yasemin.cetin@vortexlog.com"];
        var barisUser = userMap["baris.yildiz@vortexlog.com"];
        var merveUser = userMap["merve.polat@vortexlog.com"];
        var serdarUser = userMap["serdar.kurt@vortexlog.com"];

        // 4. Project 1: TechFlow Solutions — Flowtask Core Platform (FLOW)
        var flowProject = await context.Projects.FirstOrDefaultAsync(p => p.Key == "FLOW");
        if (flowProject == null)
        {
            flowProject = new Project
            {
                Name = "TechFlow — Flowtask Core Platform",
                Key = "FLOW",
                Description = "TechFlow Solutions kurumsal görev takibi, sprint yönetimi ve Kanban pano altyapısı.",
                OwnerId = techflowManager.Id,
                IsArchived = false
            };
            await context.Projects.AddAsync(flowProject);
            await context.SaveChangesAsync();

            var sprint1 = new Sprint
            {
                ProjectId = flowProject.Id,
                Name = "Sprint 1 — MVP & Çekirdek Mimari",
                Goal = "Authentication, Clean Architecture ve temel veri modellerinin tamamlanması.",
                Status = SprintStatus.Completed,
                StartDate = DateTime.UtcNow.AddDays(-20),
                EndDate = DateTime.UtcNow.AddDays(-6)
            };
            var sprint2 = new Sprint
            {
                ProjectId = flowProject.Id,
                Name = "Sprint 2 — Kanban & Çoklu Dil",
                Goal = "Sürükle-bırak Kanban panosu ve %100 Türkçe yerelleştirme sisteminin entegrasyonu.",
                Status = SprintStatus.Active,
                StartDate = DateTime.UtcNow.AddDays(-5),
                EndDate = DateTime.UtcNow.AddDays(9)
            };
            var sprint3 = new Sprint
            {
                ProjectId = flowProject.Id,
                Name = "Sprint 3 — Performans & Bildirim Merkezi",
                Goal = "WebSocket tabanlı anlık bildirimler ve audit log optimizasyonu.",
                Status = SprintStatus.Planned,
                StartDate = DateTime.UtcNow.AddDays(10),
                EndDate = DateTime.UtcNow.AddDays(24)
            };
            await context.Sprints.AddRangeAsync(sprint1, sprint2, sprint3);
            await context.SaveChangesAsync();

            var flowIssues = new List<Issue>
            {
                new()
                {
                    ProjectId = flowProject.Id,
                    SprintId = sprint1.Id,
                    ReporterId = adminUser.Id,
                    AssigneeId = mehmetUser.Id,
                    IssueKey = "FLOW-1",
                    Title = "JWT Kimlik Doğrulama & Refresh Token Altyapısı",
                    Description = "ASP.NET Core üzerinde güvenli JWT tabanlı oturum yönetimi ve sessiz token yenileme.",
                    IssueType = IssueType.Story,
                    Priority = IssuePriority.High,
                    Status = IssueStatus.Done,
                    StoryPoints = 5,
                    OrderIndex = 1
                },
                new()
                {
                    ProjectId = flowProject.Id,
                    SprintId = sprint1.Id,
                    ReporterId = demoUser.Id,
                    AssigneeId = ayseUser.Id,
                    IssueKey = "FLOW-2",
                    Title = "Temel Tasarım Sistemi & Tailwind Renk Paleti Entegrasyonu",
                    Description = "Aydınlık mod kurumsal renk paleti ve tipografi bileşenlerinin oluşturulması.",
                    IssueType = IssueType.Task,
                    Priority = IssuePriority.Medium,
                    Status = IssueStatus.Done,
                    StoryPoints = 3,
                    OrderIndex = 2
                },
                new()
                {
                    ProjectId = flowProject.Id,
                    SprintId = sprint2.Id,
                    ReporterId = adminUser.Id,
                    AssigneeId = ayseUser.Id,
                    IssueKey = "FLOW-3",
                    Title = "Kanban Panosunda Drag & Drop Sürükleme Deneyimi",
                    Description = "hello-pangea/dnd kullanarak sütunlar arası görev taşıma ve anlık durum güncelleme.",
                    IssueType = IssueType.Story,
                    Priority = IssuePriority.High,
                    Status = IssueStatus.InProgress,
                    StoryPoints = 8,
                    DueDate = DateTime.UtcNow.AddDays(2),
                    OrderIndex = 1
                },
                new()
                {
                    ProjectId = flowProject.Id,
                    SprintId = sprint2.Id,
                    ReporterId = demoUser.Id,
                    AssigneeId = mehmetUser.Id,
                    IssueKey = "FLOW-4",
                    Title = "Görev Numaralandırması & Benzersiz Anahtar (Key) Çakışma Önleyici",
                    Description = "Proje bazlı en yüksek görev numarasını dinamik hesaplayarak eşzamanlı çakışmaları engelleme.",
                    IssueType = IssueType.Bug,
                    Priority = IssuePriority.Urgent,
                    Status = IssueStatus.InReview,
                    StoryPoints = 5,
                    DueDate = DateTime.UtcNow.AddDays(1),
                    OrderIndex = 2
                },
                new()
                {
                    ProjectId = flowProject.Id,
                    SprintId = sprint2.Id,
                    ReporterId = adminUser.Id,
                    AssigneeId = elifUser.Id,
                    IssueKey = "FLOW-5",
                    Title = "E-Posta ile Çalışma Alanına Ekip Üyesi Davet Etme",
                    Description = "Kullanıcı ID (GUID) yerine doğrudan kayıtlı e-posta adresiyle üye ekleme modalı.",
                    IssueType = IssueType.Task,
                    Priority = IssuePriority.Medium,
                    Status = IssueStatus.Todo,
                    StoryPoints = 3,
                    DueDate = DateTime.UtcNow.AddDays(4),
                    OrderIndex = 3
                },
                new()
                {
                    ProjectId = flowProject.Id,
                    SprintId = sprint2.Id,
                    ReporterId = demoUser.Id,
                    AssigneeId = ayseUser.Id,
                    IssueKey = "FLOW-6",
                    Title = "Sol Alt Köşe Dil Değiştirici & Türkçe Sözlük Entegrasyonu",
                    Description = "Tüm panellerde Türkçe/İngilizce anlık geçiş ve localStorage senkronizasyonu.",
                    IssueType = IssueType.Story,
                    Priority = IssuePriority.High,
                    Status = IssueStatus.Done,
                    StoryPoints = 5,
                    OrderIndex = 4
                },
                new()
                {
                    ProjectId = flowProject.Id,
                    ReporterId = canerUser.Id,
                    AssigneeId = canerUser.Id,
                    IssueKey = "FLOW-7",
                    Title = "Docker Compose & CI/CD Dağıtım Pipeline Yapılandırması",
                    Description = "Backend API ve React Vite uygulaması için otomatik test ve build pipeline'ı.",
                    IssueType = IssueType.Task,
                    Priority = IssuePriority.Low,
                    Status = IssueStatus.Todo,
                    StoryPoints = 5,
                    OrderIndex = 5
                },
                new()
                {
                    ProjectId = flowProject.Id,
                    ReporterId = demoUser.Id,
                    AssigneeId = burakCelikUser.Id,
                    IssueKey = "FLOW-8",
                    Title = "Gelişmiş Filtreleme & Çoklu Etiket Sistemi",
                    Description = "Görevleri özel etiketler, atanan kişiler ve önceliklere göre anlık filtreleme.",
                    IssueType = IssueType.Epic,
                    Priority = IssuePriority.Medium,
                    Status = IssueStatus.Todo,
                    StoryPoints = 13,
                    OrderIndex = 6
                }
            };
            await context.Issues.AddRangeAsync(flowIssues);
            await context.SaveChangesAsync();

            var flowIssue3 = flowIssues.First(i => i.IssueKey == "FLOW-3");
            await context.Comments.AddAsync(new Comment
            {
                IssueId = flowIssue3.Id,
                UserId = mehmetUser.Id,
                Content = "Optimistik UI güncellemesi yapıldı, sunucu yanıtı beklenmeden kart sütun değiştiriyor."
            });
            await context.Comments.AddAsync(new Comment
            {
                IssueId = flowIssue3.Id,
                UserId = ayseUser.Id,
                Content = "Harika! Animasyon geçişlerini ve gölge efektlerini de test ettim, kusursuz çalışıyor."
            });
            await context.SaveChangesAsync();
        }

        // Always ensure memberships for FLOW project
        await AddMembersAsync(context, flowProject.Id, new[]
        {
            (techflowManager.Id, ProjectRoleType.Owner),
            (demoUser.Id, ProjectRoleType.Admin),
            (ayseUser.Id, ProjectRoleType.Member),
            (mehmetUser.Id, ProjectRoleType.Member),
            (canerUser.Id, ProjectRoleType.Member),
            (elifUser.Id, ProjectRoleType.Member),
            (burakCelikUser.Id, ProjectRoleType.Member),
            (duyguUser.Id, ProjectRoleType.Member),
            (adminUser.Id, ProjectRoleType.Admin)
        });

        // 5. Project 2: Acme Global Corp — E-Ticaret & Tedarik Zinciri Portalı (SHOP)
        var shopProject = await context.Projects.FirstOrDefaultAsync(p => p.Key == "SHOP");
        if (shopProject == null)
        {
            shopProject = new Project
            {
                Name = "Acme Global — E-Ticaret & Tedarik Portalı",
                Key = "SHOP",
                Description = "Yüksek hacimli ürün kataloğu, anlık stok takibi ve akıllı kargo entegrasyonu.",
                OwnerId = acmeManager.Id,
                IsArchived = false
            };
            await context.Projects.AddAsync(shopProject);
            await context.SaveChangesAsync();

            var shopSprint1 = new Sprint
            {
                ProjectId = shopProject.Id,
                Name = "Sprint 1 — Stok & Kargo Entegrasyonu",
                Goal = "Elasticsearch ürün araması ve kargo webhook entegrasyonu.",
                Status = SprintStatus.Active,
                StartDate = DateTime.UtcNow.AddDays(-4),
                EndDate = DateTime.UtcNow.AddDays(10)
            };
            await context.Sprints.AddAsync(shopSprint1);
            await context.SaveChangesAsync();

            var shopIssues = new List<Issue>
            {
                new()
                {
                    ProjectId = shopProject.Id,
                    SprintId = shopSprint1.Id,
                    ReporterId = acmeManager.Id,
                    AssigneeId = ayseUser.Id,
                    IssueKey = "SHOP-1",
                    Title = "Dinamik Ürün Filtreleme & Kategori Ağacı Bileşeni",
                    Description = "Fiyat aralığı, marka, beden ve renk filtrelerinin çoklu seçimle filtrelenmesi.",
                    IssueType = IssueType.Task,
                    Priority = IssuePriority.High,
                    Status = IssueStatus.InProgress,
                    StoryPoints = 5,
                    DueDate = DateTime.UtcNow.AddDays(2),
                    OrderIndex = 1
                },
                new()
                {
                    ProjectId = shopProject.Id,
                    SprintId = shopSprint1.Id,
                    ReporterId = demoUser.Id,
                    AssigneeId = selinUser.Id,
                    IssueKey = "SHOP-2",
                    Title = "Redis Dağıtık Kilit ile Eşzamanlı Stok Düşümü",
                    Description = "Flaş indirimlerde aynı ürünün fazladan satılmasını önleyen Redlock kilit mekanizması.",
                    IssueType = IssueType.Story,
                    Priority = IssuePriority.Urgent,
                    Status = IssueStatus.Done,
                    StoryPoints = 8,
                    OrderIndex = 2
                },
                new()
                {
                    ProjectId = shopProject.Id,
                    SprintId = shopSprint1.Id,
                    ReporterId = keremUser.Id,
                    AssigneeId = keremUser.Id,
                    IssueKey = "SHOP-3",
                    Title = "Yurtiçi & Aras Kargo Webhook Entegrasyonu",
                    Description = "Kargo durum değişikliklerinde müşteriye otomatik SMS ve bildirim iletimi.",
                    IssueType = IssueType.Story,
                    Priority = IssuePriority.Medium,
                    Status = IssueStatus.Todo,
                    StoryPoints = 5,
                    DueDate = DateTime.UtcNow.AddDays(6),
                    OrderIndex = 3
                },
                new()
                {
                    ProjectId = shopProject.Id,
                    ReporterId = busraUser.Id,
                    AssigneeId = busraUser.Id,
                    IssueKey = "SHOP-4",
                    Title = "B2B Toptan Fiyatlandırma & Özel Bayi İskonto Modülü",
                    Description = "Kurumsal müşteriler için kademeli iskonto ve sipariş onay mekanizması.",
                    IssueType = IssueType.Epic,
                    Priority = IssuePriority.Low,
                    Status = IssueStatus.Todo,
                    StoryPoints = 13,
                    OrderIndex = 4
                }
            };
            await context.Issues.AddRangeAsync(shopIssues);
            await context.SaveChangesAsync();
        }

        // Always ensure memberships for SHOP project (including Ayşe & Demo)
        await AddMembersAsync(context, shopProject.Id, new[]
        {
            (acmeManager.Id, ProjectRoleType.Owner),
            (demoUser.Id, ProjectRoleType.Admin),
            (ayseUser.Id, ProjectRoleType.Member),
            (selinUser.Id, ProjectRoleType.Member),
            (keremUser.Id, ProjectRoleType.Member),
            (busraUser.Id, ProjectRoleType.Member),
            (muratUser.Id, ProjectRoleType.Member),
            (gizemUser.Id, ProjectRoleType.Member),
            (adminUser.Id, ProjectRoleType.Admin)
        });

        // 6. Project 3: Nexus FinTech Systems — FinPay Dijital Cüzdan & Ödeme (FIN)
        var finProject = await context.Projects.FirstOrDefaultAsync(p => p.Key == "FIN");
        if (finProject == null)
        {
            finProject = new Project
            {
                Name = "Nexus FinTech — FinPay Dijital Cüzdan",
                Key = "FIN",
                Description = "3D Secure 2.0, sanal POS entegrasyonu, QR kod ile ödeme ve fraud izleme platformu.",
                OwnerId = sinanUser.Id,
                IsArchived = false
            };
            await context.Projects.AddAsync(finProject);
            await context.SaveChangesAsync();

            var finSprint1 = new Sprint
            {
                ProjectId = finProject.Id,
                Name = "Sprint 1 — 3D Secure 2.0 & Sanal POS",
                Goal = "Bankalararası sanal POS gateway ve 3D Secure 2.0 akışının tamamlanması.",
                Status = SprintStatus.Active,
                StartDate = DateTime.UtcNow.AddDays(-3),
                EndDate = DateTime.UtcNow.AddDays(11)
            };
            var finSprint2 = new Sprint
            {
                ProjectId = finProject.Id,
                Name = "Sprint 2 — QR Kod & Sadakat Puanı",
                Goal = "Restoran ve mağaza ödemelerinde dinamik QR kod ve nakit iade (cashback) mekanizması.",
                Status = SprintStatus.Planned,
                StartDate = DateTime.UtcNow.AddDays(12),
                EndDate = DateTime.UtcNow.AddDays(26)
            };
            await context.Sprints.AddRangeAsync(finSprint1, finSprint2);
            await context.SaveChangesAsync();

            var finIssues = new List<Issue>
            {
                new()
                {
                    ProjectId = finProject.Id,
                    SprintId = finSprint1.Id,
                    ReporterId = sinanUser.Id,
                    AssigneeId = ayseUser.Id,
                    IssueKey = "FIN-1",
                    Title = "PCI-DSS Uyumlu Kart Saklama (Tokenization) Servisi",
                    Description = "Müşteri kredi kartı bilgilerini HSM ve AES-256 ile şifreleyerek token üretme servisi.",
                    IssueType = IssueType.Story,
                    Priority = IssuePriority.Urgent,
                    Status = IssueStatus.InProgress,
                    StoryPoints = 8,
                    DueDate = DateTime.UtcNow.AddDays(3),
                    OrderIndex = 1
                },
                new()
                {
                    ProjectId = finProject.Id,
                    SprintId = finSprint1.Id,
                    ReporterId = sinanUser.Id,
                    AssigneeId = melikeUser.Id,
                    IssueKey = "FIN-2",
                    Title = "Kart Ekleme & Ödeme Onay Ekranı UI/UX Tasarımları",
                    Description = "Kullanıcı dostu kart tarama ve 3D SMS şifre giriş modalı tasarımı.",
                    IssueType = IssueType.Task,
                    Priority = IssuePriority.High,
                    Status = IssueStatus.Done,
                    StoryPoints = 5,
                    OrderIndex = 2
                },
                new()
                {
                    ProjectId = finProject.Id,
                    SprintId = finSprint1.Id,
                    ReporterId = adminUser.Id,
                    AssigneeId = denizUser.Id,
                    IssueKey = "FIN-3",
                    Title = "Şüpheli İşlem (Fraud) Tespit Algoritması & Uyarı Sistemi",
                    Description = "Kısa sürede farklı konumlardan yapılan yüksek tutarlı işlemleri otomatik bloke etme.",
                    IssueType = IssueType.Story,
                    Priority = IssuePriority.High,
                    Status = IssueStatus.InReview,
                    StoryPoints = 8,
                    DueDate = DateTime.UtcNow.AddDays(5),
                    OrderIndex = 3
                },
                new()
                {
                    ProjectId = finProject.Id,
                    SprintId = finSprint1.Id,
                    ReporterId = demoUser.Id,
                    AssigneeId = ozanUser.Id,
                    IssueKey = "FIN-4",
                    Title = "Otomatik İade (Refund) ve İptal API Uçları",
                    Description = "Hatalı veya iptal edilen siparişlerde müşteri kartına anında para iadesi sağlama.",
                    IssueType = IssueType.Task,
                    Priority = IssuePriority.Medium,
                    Status = IssueStatus.Todo,
                    StoryPoints = 3,
                    DueDate = DateTime.UtcNow.AddDays(7),
                    OrderIndex = 4
                },
                new()
                {
                    ProjectId = finProject.Id,
                    ReporterId = sinanUser.Id,
                    AssigneeId = eceUser.Id,
                    IssueKey = "FIN-5",
                    Title = "Apple Pay & Google Wallet Entegrasyonu",
                    Description = "Mobil cüzdanlar üzerinden tek tıkla biyometrik ödeme imkanı sağlama.",
                    IssueType = IssueType.Epic,
                    Priority = IssuePriority.Medium,
                    Status = IssueStatus.Todo,
                    StoryPoints = 13,
                    OrderIndex = 5
                }
            };
            await context.Issues.AddRangeAsync(finIssues);
            await context.SaveChangesAsync();
        }

        // Always ensure memberships for FIN project (including Ayşe & Demo)
        await AddMembersAsync(context, finProject.Id, new[]
        {
            (sinanUser.Id, ProjectRoleType.Owner),
            (demoUser.Id, ProjectRoleType.Admin),
            (ayseUser.Id, ProjectRoleType.Member),
            (denizUser.Id, ProjectRoleType.Member),
            (melikeUser.Id, ProjectRoleType.Member),
            (ozanUser.Id, ProjectRoleType.Member),
            (eceUser.Id, ProjectRoleType.Member),
            (adminUser.Id, ProjectRoleType.Admin)
        });

        // 7. Project 4: Pulse HealthTech AI — Sağlık & Tele-Tıp Randevu Asistanı (HLTH)
        var hlthProject = await context.Projects.FirstOrDefaultAsync(p => p.Key == "HLTH");
        if (hlthProject == null)
        {
            hlthProject = new Project
            {
                Name = "Pulse HealthTech — Tele-Tıp Asistanı",
                Key = "HLTH",
                Description = "Online doktor randevusu, WebRTC görüntülü muayene ve e-Reçete arşivi.",
                OwnerId = hakanUser.Id,
                IsArchived = false
            };
            await context.Projects.AddAsync(hlthProject);
            await context.SaveChangesAsync();

            var hlthSprint1 = new Sprint
            {
                ProjectId = hlthProject.Id,
                Name = "Sprint 1 — Randevu Takvimi & Görüntülü Muayene",
                Goal = "Doktor çalışma saatleri, online randevu oluşturma ve WebRTC muayene odası.",
                Status = SprintStatus.Active,
                StartDate = DateTime.UtcNow.AddDays(-2),
                EndDate = DateTime.UtcNow.AddDays(12)
            };
            await context.Sprints.AddAsync(hlthSprint1);
            await context.SaveChangesAsync();

            var hlthIssues = new List<Issue>
            {
                new()
                {
                    ProjectId = hlthProject.Id,
                    SprintId = hlthSprint1.Id,
                    ReporterId = hakanUser.Id,
                    AssigneeId = zeynepUser.Id,
                    IssueKey = "HLTH-1",
                    Title = "Doktor Çalışma Takvimi & Randevu Slotu UI Tasarımı",
                    Description = "Müsait saat aralıklarını renklendiren interaktif randevu seçim arayüzü.",
                    IssueType = IssueType.Task,
                    Priority = IssuePriority.High,
                    Status = IssueStatus.Done,
                    StoryPoints = 3,
                    OrderIndex = 1
                },
                new()
                {
                    ProjectId = hlthProject.Id,
                    SprintId = hlthSprint1.Id,
                    ReporterId = demoUser.Id,
                    AssigneeId = ayseUser.Id,
                    IssueKey = "HLTH-2",
                    Title = "WebRTC Görüntülü Muayene Odası Entegrasyonu",
                    Description = "Uçtan uca şifreli ses ve video aktarımı, ekran paylaşımı desteği.",
                    IssueType = IssueType.Story,
                    Priority = IssuePriority.Urgent,
                    Status = IssueStatus.InProgress,
                    StoryPoints = 8,
                    DueDate = DateTime.UtcNow.AddDays(4),
                    OrderIndex = 2
                },
                new()
                {
                    ProjectId = hlthProject.Id,
                    SprintId = hlthSprint1.Id,
                    ReporterId = hakanUser.Id,
                    AssigneeId = tolgaUser.Id,
                    IssueKey = "HLTH-3",
                    Title = "e-Reçete PDF Oluşturma & Karekodlu Doğrulama",
                    Description = "Muayene bitiminde otomatik imzalı PDF reçete üretimi ve eczane doğrulama kodu.",
                    IssueType = IssueType.Task,
                    Priority = IssuePriority.Medium,
                    Status = IssueStatus.Todo,
                    StoryPoints = 5,
                    DueDate = DateTime.UtcNow.AddDays(7),
                    OrderIndex = 3
                },
                new()
                {
                    ProjectId = hlthProject.Id,
                    ReporterId = hakanUser.Id,
                    AssigneeId = asliUser.Id,
                    IssueKey = "HLTH-4",
                    Title = "Radyoloji MR/Röntgen Görüntü Ön İnceleme AI Modeli",
                    Description = "DICOM formatındaki tıbbi görüntüleri tarayarak olası anomalileri işaretleyen yapay zeka servisi.",
                    IssueType = IssueType.Epic,
                    Priority = IssuePriority.High,
                    Status = IssueStatus.Todo,
                    StoryPoints = 13,
                    OrderIndex = 4
                }
            };
            await context.Issues.AddRangeAsync(hlthIssues);
            await context.SaveChangesAsync();
        }

        // Always ensure memberships for HLTH project (including Ayşe & Demo)
        await AddMembersAsync(context, hlthProject.Id, new[]
        {
            (hakanUser.Id, ProjectRoleType.Owner),
            (demoUser.Id, ProjectRoleType.Admin),
            (ayseUser.Id, ProjectRoleType.Member),
            (zeynepUser.Id, ProjectRoleType.Member),
            (tolgaUser.Id, ProjectRoleType.Member),
            (asliUser.Id, ProjectRoleType.Member),
            (cemUser.Id, ProjectRoleType.Member),
            (adminUser.Id, ProjectRoleType.Admin)
        });

        // 8. Project 5: Vortex Logistics Global — Akıllı Filo & Rota Optimizasyonu (LOG)
        var logProject = await context.Projects.FirstOrDefaultAsync(p => p.Key == "LOG");
        if (logProject == null)
        {
            logProject = new Project
            {
                Name = "Vortex Logistics — Akıllı Filo & Rota",
                Key = "LOG",
                Description = "Yapay zeka destekli dinamik rota optimizasyonu, IoT telemetri ve otonom filo takibi.",
                OwnerId = erdemUser.Id,
                IsArchived = false
            };
            await context.Projects.AddAsync(logProject);
            await context.SaveChangesAsync();

            var logSprint1 = new Sprint
            {
                ProjectId = logProject.Id,
                Name = "Sprint 1 — Dinamik Rota & IoT Telemetri",
                Goal = "Canlı GPS telemetri akışı ve teslimat rotası yakıt optimizasyon algoritması.",
                Status = SprintStatus.Active,
                StartDate = DateTime.UtcNow.AddDays(-1),
                EndDate = DateTime.UtcNow.AddDays(13)
            };
            await context.Sprints.AddAsync(logSprint1);
            await context.SaveChangesAsync();

            var logIssues = new List<Issue>
            {
                new()
                {
                    ProjectId = logProject.Id,
                    SprintId = logSprint1.Id,
                    ReporterId = erdemUser.Id,
                    AssigneeId = ayseUser.Id,
                    IssueKey = "LOG-1",
                    Title = "Canlı Filo Haritası & Sürücü Konum Takibi Dashboard",
                    Description = "Mapbox / Leaflet üzerinde 500+ aracın anlık hız, rota ve durum verilerinin görselleştirilmesi.",
                    IssueType = IssueType.Story,
                    Priority = IssuePriority.Urgent,
                    Status = IssueStatus.InProgress,
                    StoryPoints = 8,
                    DueDate = DateTime.UtcNow.AddDays(3),
                    OrderIndex = 1
                },
                new()
                {
                    ProjectId = logProject.Id,
                    SprintId = logSprint1.Id,
                    ReporterId = erdemUser.Id,
                    AssigneeId = yaseminUser.Id,
                    IssueKey = "LOG-2",
                    Title = "IoT Telemetri Cihazları MQTT Veri Akışı Bağlayıcısı",
                    Description = "Araç can-bus verilerini (yakıt, motor sıcaklığı, fren) saniyede bir merkeze aktaran protokol.",
                    IssueType = IssueType.Task,
                    Priority = IssuePriority.High,
                    Status = IssueStatus.Done,
                    StoryPoints = 5,
                    OrderIndex = 2
                },
                new()
                {
                    ProjectId = logProject.Id,
                    SprintId = logSprint1.Id,
                    ReporterId = demoUser.Id,
                    AssigneeId = barisUser.Id,
                    IssueKey = "LOG-3",
                    Title = "Trafik Yoğunluğuna Göre Alternatif Rota Hesaplama Modeli",
                    Description = "Trafik kazaları ve hava durumu verilerini harmanlayarak teslimat süresini %18 kısaltma.",
                    IssueType = IssueType.Story,
                    Priority = IssuePriority.High,
                    Status = IssueStatus.InReview,
                    StoryPoints = 8,
                    DueDate = DateTime.UtcNow.AddDays(5),
                    OrderIndex = 3
                },
                new()
                {
                    ProjectId = logProject.Id,
                    ReporterId = merveUser.Id,
                    AssigneeId = serdarUser.Id,
                    IssueKey = "LOG-4",
                    Title = "Soğuk Zincir Sıcaklık Sapması Anlık SMS/Çağrı Alarmı",
                    Description = "İlaç ve gıda taşımacılığında konteyner ısısı eşiği aştığında sürücüye ve merkeze otomatik uyarı.",
                    IssueType = IssueType.Bug,
                    Priority = IssuePriority.Urgent,
                    Status = IssueStatus.Todo,
                    StoryPoints = 5,
                    OrderIndex = 4
                }
            };
            await context.Issues.AddRangeAsync(logIssues);
            await context.SaveChangesAsync();
        }

        // Always ensure memberships for LOG project (including Ayşe & Demo)
        await AddMembersAsync(context, logProject.Id, new[]
        {
            (erdemUser.Id, ProjectRoleType.Owner),
            (demoUser.Id, ProjectRoleType.Admin),
            (ayseUser.Id, ProjectRoleType.Member),
            (yaseminUser.Id, ProjectRoleType.Member),
            (barisUser.Id, ProjectRoleType.Member),
            (merveUser.Id, ProjectRoleType.Member),
            (serdarUser.Id, ProjectRoleType.Member),
            (canerUser.Id, ProjectRoleType.Member),
            (adminUser.Id, ProjectRoleType.Admin)
        });

        // 8. Seed Notifications for Admin and Demo Users
        if (!await context.Notifications.AnyAsync())
        {
            var notifications = new List<Notification>
            {
                new()
                {
                    UserId = adminUser.Id,
                    Type = NotificationType.IssueAssigned,
                    Title = "Yeni Görev Atandı",
                    Message = "FLOW-5: E-Posta ile Çalışma Alanına Ekip Üyesi Davet Etme görevi size atandı.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-25)
                },
                new()
                {
                    UserId = adminUser.Id,
                    Type = NotificationType.SystemAlert,
                    Title = "Sistem Güncellemesi",
                    Message = "Flowtask v2.0 sürümüne başarıyla güncellendi. Tüm Türkçe dil desteği aktif.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow.AddHours(-2)
                },
                new()
                {
                    UserId = demoUser.Id,
                    Type = NotificationType.IssueAssigned,
                    Title = "Görev Durumu Güncellendi",
                    Message = "FIN-1 (PCI-DSS Uyumlu Kart Saklama) görevi 'Devam Eden' durumuna taşındı.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-40)
                },
                new()
                {
                    UserId = demoUser.Id,
                    Type = NotificationType.ProjectInvited,
                    Title = "Projeye Eklendiniz",
                    Message = "Flowtask Core Platform ve E-Ticaret projelerine yönetici yetkisiyle eklendiniz.",
                    IsRead = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-1)
                }
            };
            await context.Notifications.AddRangeAsync(notifications);
            await context.SaveChangesAsync();
        }
    }

    private static async Task AddMembersAsync(ApplicationDbContext context, Guid projectId, (Guid UserId, ProjectRoleType Role)[] members)
    {
        foreach (var (userId, role) in members)
        {
            if (!await context.ProjectMembers.AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == userId))
            {
                await context.ProjectMembers.AddAsync(new ProjectMember
                {
                    ProjectId = projectId,
                    UserId = userId,
                    Role = role
                });
            }
        }
        await context.SaveChangesAsync();
    }

    private static List<Permission> GetPermissions()
    {
        return new List<Permission>
        {
            // System Admin Permissions
            new() { Code = "admin.users.read", Group = "Admin", Description = "View all users in the system" },
            new() { Code = "admin.users.create", Group = "Admin", Description = "Create new users" },
            new() { Code = "admin.users.update", Group = "Admin", Description = "Update user details and status" },
            new() { Code = "admin.users.delete", Group = "Admin", Description = "Delete or deactivate users" },
            new() { Code = "admin.roles.manage", Group = "Admin", Description = "Manage roles and system permissions" },
            new() { Code = "admin.projects.read", Group = "Admin", Description = "View all projects in the system" },
            new() { Code = "admin.projects.delete", Group = "Admin", Description = "Delete or archive any project" },
            new() { Code = "admin.statistics.read", Group = "Admin", Description = "View platform global statistics" },
            new() { Code = "admin.activitylogs.read", Group = "Admin", Description = "View global audit logs" },

            // Project Permissions
            new() { Code = "project.create", Group = "Project", Description = "Create new projects" },
            new() { Code = "project.read", Group = "Project", Description = "View project details and dashboard" },
            new() { Code = "project.update", Group = "Project", Description = "Update project settings" },
            new() { Code = "project.delete", Group = "Project", Description = "Delete or archive project" },
            new() { Code = "project.members.read", Group = "Project", Description = "View project members" },
            new() { Code = "project.members.add", Group = "Project", Description = "Invite or add members to project" },
            new() { Code = "project.members.update", Group = "Project", Description = "Update project member role" },
            new() { Code = "project.members.remove", Group = "Project", Description = "Remove members from project" },

            // Issue Permissions
            new() { Code = "issue.create", Group = "Issue", Description = "Create new tasks/issues" },
            new() { Code = "issue.read", Group = "Issue", Description = "View issue details" },
            new() { Code = "issue.update", Group = "Issue", Description = "Update issue fields" },
            new() { Code = "issue.delete", Group = "Issue", Description = "Delete issue" },
            new() { Code = "issue.assign", Group = "Issue", Description = "Assign issues to members" },
            new() { Code = "issue.status.update", Group = "Issue", Description = "Change issue workflow status" },

            // Sprint Permissions
            new() { Code = "sprint.read", Group = "Sprint", Description = "View sprints and backlog" },
            new() { Code = "sprint.create", Group = "Sprint", Description = "Create new sprint" },
            new() { Code = "sprint.update", Group = "Sprint", Description = "Start, complete or edit sprint" },
            new() { Code = "sprint.delete", Group = "Sprint", Description = "Delete sprint" },

            // Comment & Attachment Permissions
            new() { Code = "comment.create", Group = "Comment", Description = "Post comments on issues" },
            new() { Code = "comment.update.own", Group = "Comment", Description = "Edit own comments" },
            new() { Code = "comment.delete.own", Group = "Comment", Description = "Delete own comments" },
            new() { Code = "comment.delete.any", Group = "Comment", Description = "Delete any comment (Admin)" },
            new() { Code = "attachment.upload", Group = "Attachment", Description = "Upload file attachments" },
            new() { Code = "attachment.delete", Group = "Attachment", Description = "Delete file attachments" },

            // Notification Permissions
            new() { Code = "notification.read", Group = "Notification", Description = "View and manage own notifications" }
        };
    }
}
