import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Output path
IMG_DIR = r"C:\Users\DELL\Desktop\community-help-hub\scripts\report_images"
os.makedirs(IMG_DIR, exist_ok=True)
out_path = os.path.join(IMG_DIR, "fig3_1_architecture.png")

# Set figure size and resolution
fig, ax = plt.subplots(figsize=(11, 8.5), dpi=300)
ax.set_xlim(0, 11)
ax.set_ylim(0, 8.5)
ax.axis('off')

# Background color
fig.patch.set_facecolor('#ffffff')

# Helper for drawing rounded boxes
def draw_box(x, y, w, h, bg_color, border_color, title, items, header_bg='#0f172a', header_text_color='#ffffff'):
    # Main box
    box = patches.FancyBboxPatch(
        (x, y), w, h,
        boxstyle="round,pad=0.08,rounding_size=0.15",
        facecolor=bg_color, edgecolor=border_color, linewidth=1.8, zorder=2
    )
    ax.add_patch(box)
    
    # Header box
    header_h = 0.55
    header_box = patches.FancyBboxPatch(
        (x, y + h - header_h), w, header_h,
        boxstyle="round,pad=0.08,rounding_size=0.15",
        facecolor=header_bg, edgecolor=border_color, linewidth=1.8, zorder=3
    )
    ax.add_patch(header_box)
    
    # Header title
    ax.text(x + w / 2, y + h - header_h / 2, title,
            ha='center', va='center', fontsize=11, fontweight='bold', color=header_text_color, zorder=4)
    
    # Sub-boxes / items inside
    n_items = len(items)
    cols = 3 if n_items == 6 else (2 if n_items == 4 else 3)
    rows = (n_items + cols - 1) // cols
    
    margin_x = 0.25
    margin_y = 0.2
    available_w = w - (margin_x * (cols + 1))
    sub_w = available_w / cols
    available_h = (h - header_h) - (margin_y * (rows + 1))
    sub_h = available_h / rows
    
    for idx, item in enumerate(items):
        r = idx // cols
        c = idx % cols
        sub_x = x + margin_x + c * (sub_w + margin_x)
        sub_y = (y + h - header_h) - margin_y - (r + 1) * sub_h
        
        # item box
        item_patch = patches.FancyBboxPatch(
            (sub_x, sub_y), sub_w, sub_h,
            boxstyle="round,pad=0.04,rounding_size=0.08",
            facecolor='#ffffff', edgecolor='#cbd5e1', linewidth=1.2, zorder=5
        )
        ax.add_patch(item_patch)
        
        # item text
        title_txt, desc_txt = item
        ax.text(sub_x + sub_w / 2, sub_y + sub_h * 0.65, title_txt,
                ha='center', va='center', fontsize=8.5, fontweight='bold', color='#1e293b', zorder=6)
        ax.text(sub_x + sub_w / 2, sub_y + sub_h * 0.32, desc_txt,
                ha='center', va='center', fontsize=7.2, color='#64748b', zorder=6)

# 1. Tier 1: Presentation Tier
t1_items = [
    ("React 18 SPA Engine", "Single-Page Application with Hooks"),
    ("React Router DOM v6", "Declarative Navigation & Protected Routes"),
    ("Context API State Store", "AuthContext for JWT & User Session"),
    ("Axios HTTP Client", "Auto-attaches Bearer JWT Auth Header"),
    ("Chart.js Visualizations", "Category Doughnut & City Bar Telemetry"),
    ("CSS Grid & Flexbox", "Mobile & Desktop Responsive Layouts")
]
draw_box(0.5, 6.0, 10.0, 2.0, '#f8fafc', '#3b82f6', 
         "TIER 1: PRESENTATION TIER (CLIENT BROWSER - PORT 3000)", t1_items, header_bg='#1e3a8a')

# 2. Connector 1: HTTP/REST
ax.annotate("", xy=(5.5, 5.4), xytext=(5.5, 5.95),
            arrowprops=dict(arrowstyle="->", color="#2563eb", lw=2.5, mutation_scale=15), zorder=7)
ax.annotate("", xy=(5.5, 5.95), xytext=(5.5, 5.4),
            arrowprops=dict(arrowstyle="->", color="#10b981", lw=2.5, mutation_scale=15), zorder=7)

lbl1 = patches.FancyBboxPatch((2.2, 5.45), 6.6, 0.45,
                             boxstyle="round,pad=0.04,rounding_size=0.08",
                             facecolor='#f1f5f9', edgecolor='#94a3b8', linewidth=1.2, zorder=8)
ax.add_patch(lbl1)
ax.text(5.5, 5.67, "HTTP / REST API (JSON Payloads | Bearer JWT Authentication | 20 Endpoints)",
        ha='center', va='center', fontsize=8.5, fontweight='bold', color='#0f172a', zorder=9)

# 3. Tier 2: Application / Business Logic Tier
t2_items = [
    ("Express.js REST Framework", "Modular Routes & Controllers Architecture"),
    ("Auth Middleware", "BCrypt Hashing (10 Rounds) & JWT Validation"),
    ("Atomic Capacity Guards", "Prevents Slot Overbooking (volunteersAssigned)"),
    ("100-Point AI Recommendation", "Skill (40%) + City (30%) + Category + Urgency"),
    ("PDFKit Certificate Engine", "Tamper-Evident In-Memory PDF Streaming"),
    ("Security & CORS Guards", "Origin Whitelisting & .env Isolation")
]
draw_box(0.5, 3.25, 10.0, 2.0, '#f0fdf4', '#059669', 
         "TIER 2: APPLICATION & BUSINESS LOGIC TIER (NODE.JS + EXPRESS.JS - PORT 5000)", t2_items, header_bg='#065f46')

# 4. Connector 2: Mongoose / MongoDB
ax.annotate("", xy=(5.5, 2.65), xytext=(5.5, 3.2),
            arrowprops=dict(arrowstyle="->", color="#059669", lw=2.5, mutation_scale=15), zorder=7)
ax.annotate("", xy=(5.5, 3.2), xytext=(5.5, 2.65),
            arrowprops=dict(arrowstyle="->", color="#d97706", lw=2.5, mutation_scale=15), zorder=7)

lbl2 = patches.FancyBboxPatch((2.2, 2.72), 6.6, 0.45,
                             boxstyle="round,pad=0.04,rounding_size=0.08",
                             facecolor='#f1f5f9', edgecolor='#94a3b8', linewidth=1.2, zorder=8)
ax.add_patch(lbl2)
ax.text(5.5, 2.94, "Mongoose ODM (Schema Validation | Indexed Lookups | Atomic $inc Updates)",
        ha='center', va='center', fontsize=8.5, fontweight='bold', color='#0f172a', zorder=9)

# 5. Tier 3: Data Persistence Tier
t3_items = [
    ("users Collection", "Credentials, Roles, Skills, City, Dynamic Hours"),
    ("tasks Collection", "6 Categories, Headcount Quotas, Schedule, Location"),
    ("applications Collection", "Applied/Completed States, Volunteer References"),
    ("categories Collection", "6 Predefined Social Service Categories & Badges"),
    ("certificates Collection", "Tamper-Evident Records & Verification Identifiers"),
    ("auditlogs Collection", "Administrative Activity & System Event Logs")
]
draw_box(0.5, 0.5, 10.0, 2.0, '#eff6ff', '#2563eb', 
         "TIER 3: DATA PERSISTENCE TIER (MONGODB ATLAS CLOUD REPLICA SET)", t3_items, header_bg='#1e293b')

plt.tight_layout()
plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
plt.close()
print("Generated fig3_1_architecture.png successfully at:", out_path)
