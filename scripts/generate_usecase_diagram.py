import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Output path
IMG_DIR = r"C:\Users\DELL\Desktop\community-help-hub\scripts\report_images"
os.makedirs(IMG_DIR, exist_ok=True)
out_path = os.path.join(IMG_DIR, "fig3_2_usecase.png")

# Set figure size and resolution
fig, ax = plt.subplots(figsize=(11, 8.5), dpi=300)
ax.set_xlim(0, 11)
ax.set_ylim(0, 8.5)
ax.axis('off')

# Background
fig.patch.set_facecolor('#ffffff')

# System Boundary Box
sys_box = patches.FancyBboxPatch(
    (2.4, 0.4), 6.2, 7.6,
    boxstyle="round,pad=0.06,rounding_size=0.15",
    facecolor='#f8fafc', edgecolor='#0f172a', linewidth=2.0, zorder=1
)
ax.add_patch(sys_box)

# System Title Header
header_patch = patches.FancyBboxPatch(
    (2.4, 7.5), 6.2, 0.5,
    boxstyle="round,pad=0.06,rounding_size=0.15",
    facecolor='#0f172a', edgecolor='#0f172a', linewidth=2.0, zorder=2
)
ax.add_patch(header_patch)
ax.text(5.5, 7.75, "SYSTEM BOUNDARY: COMMUNITYHELP HUB PLATFORM",
        ha='center', va='center', fontsize=11, fontweight='bold', color='#ffffff', zorder=3)

# Helper for drawing Actor
def draw_actor(x, y, name, role_color='#1e3a8a'):
    # Head
    head = patches.Circle((x, y + 0.45), 0.18, facecolor='#ffffff', edgecolor=role_color, linewidth=2.0, zorder=5)
    ax.add_patch(head)
    # Body
    ax.plot([x, x], [y + 0.27, y - 0.15], color=role_color, lw=2.2, zorder=5)
    # Arms
    ax.plot([x - 0.28, x + 0.28], [y + 0.12, y + 0.12], color=role_color, lw=2.2, zorder=5)
    # Legs
    ax.plot([x, x - 0.22], [y - 0.15, y - 0.55], color=role_color, lw=2.2, zorder=5)
    ax.plot([x, x + 0.22], [y - 0.15, y - 0.55], color=role_color, lw=2.2, zorder=5)
    # Label box
    lbl = patches.FancyBboxPatch(
        (x - 0.9, y - 0.95), 1.8, 0.35,
        boxstyle="round,pad=0.03,rounding_size=0.08",
        facecolor=role_color, edgecolor=role_color, zorder=5
    )
    ax.add_patch(lbl)
    ax.text(x, y - 0.77, name, ha='center', va='center', fontsize=8.5, fontweight='bold', color='#ffffff', zorder=6)

# Draw Actors
draw_actor(1.2, 5.0, "Volunteer", '#059669')          # Volunteer left
draw_actor(9.8, 5.0, "NGO Coordinator", '#2563eb')    # NGO right
draw_actor(1.2, 1.8, "Administrator", '#d97706')      # Admin left-bottom

# Use Case Definitions: (center_x, center_y, text, width, height, fillcolor, bordercolor)
use_cases = [
    # Shared
    (5.5, 7.0, "Register / Authenticate (JWT)", 3.4, 0.42, '#ffffff', '#475569'),
    # Volunteer specific
    (4.2, 6.2, "Maintain Profile & Skill Tags", 3.0, 0.42, '#ecfdf5', '#059669'),
    (4.2, 5.4, "Browse & Filter Drives (4 Modes)", 3.0, 0.42, '#ecfdf5', '#059669'),
    (4.2, 4.6, "100-Point AI Recommendation", 3.0, 0.42, '#ecfdf5', '#059669'),
    (4.2, 3.8, "Apply for Task (Capacity Guard)", 3.0, 0.42, '#ecfdf5', '#059669'),
    (4.2, 3.0, "Track Application Status", 3.0, 0.42, '#ecfdf5', '#059669'),
    (4.2, 2.2, "View Leaderboard & Badges", 3.0, 0.42, '#ecfdf5', '#059669'),
    (4.2, 1.4, "Download PDF Certificate", 3.0, 0.42, '#ecfdf5', '#059669'),
    # NGO specific
    (6.8, 6.2, "Publish Social Service Drive", 3.0, 0.42, '#eff6ff', '#2563eb'),
    (6.8, 5.4, "Set Category & Quota Limits", 3.0, 0.42, '#eff6ff', '#2563eb'),
    (6.8, 4.6, "Review Volunteer Applicants", 3.0, 0.42, '#eff6ff', '#2563eb'),
    (6.8, 3.8, "Approve & Mark Completed", 3.0, 0.42, '#eff6ff', '#2563eb'),
    (6.8, 3.0, "Award Verified Service Hours", 3.0, 0.42, '#eff6ff', '#2563eb'),
    # Admin specific
    (5.5, 0.75, "View Impact Telemetry & Audit System Logs", 3.8, 0.42, '#fffbeb', '#d97706')
]

# Draw Use Case Ellipses
uc_patches = {}
for idx, (cx, cy, txt, w, h, fc, bc) in enumerate(use_cases):
    ellipse = patches.Ellipse((cx, cy), w, h, facecolor=fc, edgecolor=bc, linewidth=1.5, zorder=3)
    ax.add_patch(ellipse)
    ax.text(cx, cy, txt, ha='center', va='center', fontsize=8.2, fontweight='bold', color='#0f172a', zorder=4)
    uc_patches[txt] = (cx, cy, w, h)

# Draw Association Lines (Actor to Use Cases)
def draw_line(x1, y1, x2, y2, color='#64748b', lw=1.3, dashed=False):
    ls = '--' if dashed else '-'
    ax.plot([x1, x2], [y1, y2], color=color, lw=lw, linestyle=ls, zorder=2)

# Volunteer connections (x=1.2, y=5.0)
vol_x, vol_y = 1.4, 5.0
draw_line(vol_x, vol_y, 3.8, 7.0, '#059669') # Login
draw_line(vol_x, vol_y, 2.7, 6.2, '#059669') # Profile
draw_line(vol_x, vol_y, 2.7, 5.4, '#059669') # Browse
draw_line(vol_x, vol_y, 2.7, 4.6, '#059669') # AI Rec
draw_line(vol_x, vol_y, 2.7, 3.8, '#059669') # Apply
draw_line(vol_x, vol_y, 2.7, 3.0, '#059669') # Track
draw_line(vol_x, vol_y, 2.7, 2.2, '#059669') # Leaderboard
draw_line(vol_x, vol_y, 2.7, 1.4, '#059669') # Certificate

# NGO connections (x=9.8, y=5.0)
ngo_x, ngo_y = 9.6, 5.0
draw_line(ngo_x, ngo_y, 7.2, 7.0, '#2563eb') # Login
draw_line(ngo_x, ngo_y, 8.3, 6.2, '#2563eb') # Publish
draw_line(ngo_x, ngo_y, 8.3, 5.4, '#2563eb') # Quota
draw_line(ngo_x, ngo_y, 8.3, 4.6, '#2563eb') # Review
draw_line(ngo_x, ngo_y, 8.3, 3.8, '#2563eb') # Approve
draw_line(ngo_x, ngo_y, 8.3, 3.0, '#2563eb') # Award Hours

# Admin connections (x=1.2, y=1.8)
adm_x, adm_y = 1.4, 1.8
draw_line(adm_x, adm_y, 3.6, 0.75, '#d97706') # Impact Telemetry
draw_line(adm_x, adm_y, 3.8, 7.0, '#d97706')  # Login

# <<extend>> and <<include>> relationships
ax.annotate("<<extend>>", xy=(4.2, 4.85), xytext=(4.2, 5.15),
            ha='center', va='center', fontsize=7.0, color='#059669', fontweight='bold', zorder=5)
ax.annotate("", xy=(4.2, 4.8), xytext=(4.2, 5.2),
            arrowprops=dict(arrowstyle="->", color="#059669", lw=1.2, ls="--"), zorder=4)

ax.annotate("<<include>>", xy=(6.8, 3.25), xytext=(6.8, 3.55),
            ha='center', va='center', fontsize=7.0, color='#2563eb', fontweight='bold', zorder=5)
ax.annotate("", xy=(6.8, 3.2), xytext=(6.8, 3.6),
            arrowprops=dict(arrowstyle="->", color="#2563eb", lw=1.2, ls="--"), zorder=4)

plt.tight_layout()
plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
plt.close()
print("Generated fig3_2_usecase.png successfully at:", out_path)
