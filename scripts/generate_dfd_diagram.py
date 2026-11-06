import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Output path
IMG_DIR = r"C:\Users\DELL\Desktop\community-help-hub\scripts\report_images"
os.makedirs(IMG_DIR, exist_ok=True)
out_path = os.path.join(IMG_DIR, "fig3_3_dfd.png")

# Set figure size and resolution (stacked Level 0 and Level 1)
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(11, 10.5), dpi=300, gridspec_kw={'height_ratios': [1, 1.45]})
fig.patch.set_facecolor('#ffffff')

# ==============================================================================
# SUBPLOT 1: LEVEL 0 CONTEXT DFD
# ==============================================================================
ax1.set_xlim(0, 11)
ax1.set_ylim(0, 4.5)
ax1.axis('off')

# Section title
title_box1 = patches.FancyBboxPatch((0.5, 4.0), 10.0, 0.4,
                                   boxstyle="round,pad=0.04,rounding_size=0.08",
                                   facecolor='#0f172a', edgecolor='#0f172a', zorder=2)
ax1.add_patch(title_box1)
ax1.text(5.5, 4.2, "LEVEL 0 CONTEXT DATA FLOW DIAGRAM", 
         ha='center', va='center', fontsize=10, fontweight='bold', color='#ffffff', zorder=3)

# External Entity: Volunteer (Left)
e_vol = patches.FancyBboxPatch((0.6, 1.5), 2.0, 1.8,
                              boxstyle="round,pad=0.06,rounding_size=0.1",
                              facecolor='#ecfdf5', edgecolor='#059669', linewidth=1.8, zorder=2)
ax1.add_patch(e_vol)
ax1.text(1.6, 2.75, "EXTERNAL ENTITY", ha='center', va='center', fontsize=7.0, color='#047857', fontweight='bold', zorder=3)
ax1.text(1.6, 2.35, "Volunteer", ha='center', va='center', fontsize=11, fontweight='bold', color='#0f172a', zorder=3)
ax1.text(1.6, 1.85, "(Student / Citizen)", ha='center', va='center', fontsize=8.0, color='#64748b', zorder=3)

# Central System Bubble (0.0)
sys_circle = patches.Ellipse((5.5, 2.4), 3.0, 2.0,
                             facecolor='#f1f5f9', edgecolor='#2563eb', linewidth=2.2, zorder=2)
ax1.add_patch(sys_circle)
ax1.text(5.5, 2.85, "0.0", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#1d4ed8', zorder=3)
ax1.text(5.5, 2.45, "CommunityHelp Hub", ha='center', va='center', fontsize=11, fontweight='bold', color='#0f172a', zorder=3)
ax1.text(5.5, 2.05, "Platform System", ha='center', va='center', fontsize=9.5, color='#475569', zorder=3)

# External Entity: NGO Coordinator (Right)
e_ngo = patches.FancyBboxPatch((8.4, 1.5), 2.0, 1.8,
                              boxstyle="round,pad=0.06,rounding_size=0.1",
                              facecolor='#eff6ff', edgecolor='#2563eb', linewidth=1.8, zorder=2)
ax1.add_patch(e_ngo)
ax1.text(9.4, 2.75, "EXTERNAL ENTITY", ha='center', va='center', fontsize=7.0, color='#1d4ed8', fontweight='bold', zorder=3)
ax1.text(9.4, 2.35, "NGO Coordinator", ha='center', va='center', fontsize=11, fontweight='bold', color='#0f172a', zorder=3)
ax1.text(9.4, 1.85, "(Welfare Foundation)", ha='center', va='center', fontsize=8.0, color='#64748b', zorder=3)

# External Entity: Administrator (Bottom)
e_adm = patches.FancyBboxPatch((4.2, 0.1), 2.6, 0.75,
                              boxstyle="round,pad=0.04,rounding_size=0.08",
                              facecolor='#fffbeb', edgecolor='#d97706', linewidth=1.5, zorder=2)
ax1.add_patch(e_adm)
ax1.text(5.5, 0.48, "Administrator", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#92400e', zorder=3)

# Arrows Volunteer <-> System
ax1.annotate("", xy=(4.0, 2.7), xytext=(2.6, 2.7),
             arrowprops=dict(arrowstyle="->", color="#059669", lw=1.5), zorder=4)
ax1.text(3.3, 2.9, "Credentials, Skills,\nTask Application", ha='center', va='bottom', fontsize=7.2, color='#047857', zorder=5)

ax1.annotate("", xy=(2.6, 2.1), xytext=(4.0, 2.1),
             arrowprops=dict(arrowstyle="->", color="#2563eb", lw=1.5), zorder=4)
ax1.text(3.3, 1.9, "Task Feed, AI Matches,\nPDF Certificate", ha='center', va='top', fontsize=7.2, color='#1d4ed8', zorder=5)

# Arrows NGO <-> System
ax1.annotate("", xy=(7.0, 2.7), xytext=(8.4, 2.7),
             arrowprops=dict(arrowstyle="->", color="#2563eb", lw=1.5), zorder=4)
ax1.text(7.7, 2.9, "Drive Specs, Quota,\nApproved Attendance", ha='center', va='bottom', fontsize=7.2, color='#1d4ed8', zorder=5)

ax1.annotate("", xy=(8.4, 2.1), xytext=(7.0, 2.1),
             arrowprops=dict(arrowstyle="->", color="#059669", lw=1.5), zorder=4)
ax1.text(7.7, 1.9, "Applicant Rosters,\nDrive Impact Status", ha='center', va='top', fontsize=7.2, color='#047857', zorder=5)

# Arrows Admin <-> System
ax1.annotate("", xy=(5.2, 1.4), xytext=(5.2, 0.85),
             arrowprops=dict(arrowstyle="->", color="#d97706", lw=1.5), zorder=4)
ax1.annotate("", xy=(5.8, 0.85), xytext=(5.8, 1.4),
             arrowprops=dict(arrowstyle="->", color="#475569", lw=1.5), zorder=4)
ax1.text(5.5, 1.12, "Audit / Metrics", ha='center', va='center', fontsize=7.2, color='#92400e', backgroundcolor='#ffffff', zorder=5)


# ==============================================================================
# SUBPLOT 2: LEVEL 1 DETAILED PROCESS DECOMPOSITION DFD
# ==============================================================================
ax2.set_xlim(0, 11)
ax2.set_ylim(0, 6.2)
ax2.axis('off')

# Section title
title_box2 = patches.FancyBboxPatch((0.5, 5.75), 10.0, 0.38,
                                   boxstyle="round,pad=0.04,rounding_size=0.08",
                                   facecolor='#0f172a', edgecolor='#0f172a', zorder=2)
ax2.add_patch(title_box2)
ax2.text(5.5, 5.94, "LEVEL 1 DETAILED PROCESS DECOMPOSITION DFD", 
         ha='center', va='center', fontsize=10, fontweight='bold', color='#ffffff', zorder=3)

# Helper for drawing DFD process bubbles
def draw_process(ax, cx, cy, num, name, fc='#ffffff', bc='#2563eb'):
    p_box = patches.FancyBboxPatch((cx - 1.4, cy - 0.38), 2.8, 0.76,
                                  boxstyle="round,pad=0.04,rounding_size=0.12",
                                  facecolor=fc, edgecolor=bc, linewidth=1.6, zorder=3)
    ax.add_patch(p_box)
    ax.text(cx, cy + 0.15, num, ha='center', va='center', fontsize=7.5, fontweight='bold', color=bc, zorder=4)
    ax.text(cx, cy - 0.12, name, ha='center', va='center', fontsize=8.2, fontweight='bold', color='#0f172a', zorder=4)

# Helper for drawing open-ended Data Stores
def draw_store(ax, cx, cy, code, name):
    w, h = 2.4, 0.45
    # top and bottom lines only
    ax.plot([cx - w/2, cx + w/2], [cy + h/2, cy + h/2], color='#0f172a', lw=1.8, zorder=3)
    ax.plot([cx - w/2, cx + w/2], [cy - h/2, cy - h/2], color='#0f172a', lw=1.8, zorder=3)
    # left closing bar
    ax.plot([cx - w/2, cx - w/2], [cy - h/2, cy + h/2], color='#0f172a', lw=1.8, zorder=3)
    # background fill
    bg = patches.Rectangle((cx - w/2, cy - h/2), w, h, facecolor='#f8fafc', edgecolor='none', zorder=2)
    ax.add_patch(bg)
    ax.text(cx - w/2 + 0.35, cy, code, ha='center', va='center', fontsize=8.2, fontweight='bold', color='#2563eb', zorder=4)
    ax.plot([cx - w/2 + 0.7, cx - w/2 + 0.7], [cy - h/2, cy + h/2], color='#cbd5e1', lw=1.2, zorder=3)
    ax.text(cx + 0.35, cy, name, ha='center', va='center', fontsize=8.0, fontweight='bold', color='#0f172a', zorder=4)

# Draw 6 Processes
draw_process(ax2, 2.0, 4.8, "1.0", "User Authentication", '#ecfdf5', '#059669')
draw_process(ax2, 9.0, 4.8, "2.0", "Task Publishing & Quotas", '#eff6ff', '#2563eb')
draw_process(ax2, 5.5, 3.7, "3.0", "AI Recommendation Engine", '#f5f3ff', '#7c3aed')
draw_process(ax2, 2.0, 2.4, "4.0", "Application Capacity Guard", '#ecfdf5', '#059669')
draw_process(ax2, 9.0, 2.4, "5.0", "Verification & PDF Certificate", '#eff6ff', '#2563eb')
draw_process(ax2, 5.5, 1.2, "6.0", "Leaderboard & Analytics", '#fffbeb', '#d97706')

# Draw 4 Data Stores
draw_store(ax2, 5.5, 4.8, "D1", "Users Store")
draw_store(ax2, 5.5, 2.8, "D2", "Tasks Store")
draw_store(ax2, 2.0, 0.6, "D3", "Applications Store")
draw_store(ax2, 9.0, 0.6, "D4", "Certificates Store")

# Data Flow Connections
def flow(ax, x1, y1, x2, y2, label="", color="#475569", rad=0.0):
    conn = patches.ConnectionStyle("Arc3", rad=rad) if rad != 0.0 else None
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="->", color=color, lw=1.4, connectionstyle=conn), zorder=3)
    if label:
        mx, my = (x1 + x2)/2, (y1 + y2)/2
        ax.text(mx, my, label, ha='center', va='center', fontsize=6.8, color=color,
                backgroundcolor='#ffffff', zorder=4)

# 1.0 <-> D1
flow(ax2, 3.4, 4.9, 4.3, 4.9, "Validate", '#059669')
flow(ax2, 4.3, 4.7, 3.4, 4.7, "JWT Token", '#059669')

# 2.0 <-> D2
flow(ax2, 7.6, 4.8, 6.7, 4.8, "Write Drive", '#2563eb')

# 3.0 reads D1 and D2
flow(ax2, 5.5, 4.5, 5.5, 4.1, "Read Skills/City", '#7c3aed')
flow(ax2, 5.5, 3.3, 5.5, 3.0, "Read Open Drives", '#7c3aed')

# 4.0 checks D2 capacity and writes D3
flow(ax2, 3.4, 2.5, 4.3, 2.7, "Check Quota", '#059669')
flow(ax2, 2.0, 2.0, 2.0, 0.85, "Save Application", '#059669')

# 5.0 updates D3, D1 and writes D4
flow(ax2, 7.6, 2.4, 6.7, 2.6, "Update Status", '#2563eb')
flow(ax2, 9.0, 2.0, 9.0, 0.85, "Stream PDF", '#2563eb')

# 6.0 reads D3 and displays telemetry
flow(ax2, 3.2, 0.8, 4.2, 1.1, "Aggregate Hours", '#d97706')

plt.tight_layout()
plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
plt.close()
print("Generated fig3_3_dfd.png successfully at:", out_path)
