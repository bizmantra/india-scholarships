// scripts/build-child-theme.js
// Script to generate the complete GeneratePress Child Theme with custom single CPT and taxonomy templates.
// Run: node scripts/build-child-theme.js

const fs = require('fs');
const path = require('path');

const targetDir = '/Users/roshankumar/Desktop/Wordpress/generatepress-child';

// Create directories
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 1. style.css
const styleCss = `/*
 Theme Name:   GeneratePress Child
 Theme URI:    https://generatepress.com
 Description:  GeneratePress Child Theme with premium custom CPT templates for IndiaScholarships.
 Author:       Antigravity
 Template:     generatepress
 Version:      1.0.0
*/
`;

// 2. functions.php
const functionsPhp = `<?php
add_action( 'wp_enqueue_scripts', 'gp_child_enqueue_styles' );
function gp_child_enqueue_styles() {
    wp_enqueue_style( 'parent-style', get_template_directory_uri() . '/style.css' );
    wp_enqueue_style( 'child-style', get_stylesheet_directory_uri() . '/style.css', array('parent-style') );
}

// Helper to format currency for templates
function is_format_amount($amount, $desc = '') {
    if (!$amount || $amount == 0) {
        return $desc ? esc_html($desc) : 'Check official notification';
    }
    if ($amount >= 100000) {
        return '₹' . number_format(($amount / 100000), 1) . ' Lakh+';
    }
    if ($amount >= 1000) {
        return '₹' . number_format(($amount / 1000), 0) . 'k+';
    }
    return '₹' . number_format($amount);
}
`;

// 3. single-scholarship.php
const singleScholarshipPhp = `<?php
/**
 * The template for displaying single scholarship posts
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

get_header(); 

// Load ACF values
$amount_annual = get_field('amount_annual');
$amount_description = get_field('amount_description');
$provider = get_field('provider');
$provider_type = get_field('provider_type');
$intro_seo = get_field('intro_seo');
$benefits = get_field('benefits');
$income_limit = get_field('income_limit');
$min_marks = get_field('min_marks');
$level = get_field('level');
$state = get_field('state');
$gender = get_field('gender');
$age_limit = get_field('age_limit');
$caste = get_field('caste');
$selection = get_field('selection');
$renewal = get_field('renewal');
$step_guide = get_field('step_guide');
$docs_needed = get_field('docs_needed');
$apply_url = get_field('apply_url');
$deadline = get_field('deadline');
$deadline_description = get_field('deadline_description');
$helpline = get_field('helpline');
$faq_json = get_field('faq_json');
$course_stream = get_field('course_stream');
$special_conditions = get_field('special_conditions');
$application_mode = get_field('application_mode');
$official_source = get_field('official_source');
$always_open = get_field('always_open');

// Process levels list
$level_list = is_array($level) ? implode(', ', $level) : $level;

// Format amount display
$amount_display = is_format_amount($amount_annual, $amount_description);

// Calculate status
$today = new DateTime();
$deadline_date = $deadline ? new DateTime($deadline) : null;
$is_open = $always_open || !$deadline_date || $deadline_date >= $today;

// Helper to format/parse Markdown text to HTML in PHP
function is_render_markdown_as_html($text, $type = 'list') {
    if (!$text) {
        return '<p style="color: #94a3b8; font-style: italic;">Not specified</p>';
    }

    // Replace Markdown links: [Text](URL) -> <a href="URL" target="_blank" rel="noopener nofollow">Text</a>
    $text = preg_replace('/\\\\[([^\\\\]]+)\\\\]\\\\(([^)]+)\\\\)/', '<a href="$2" target="_blank" rel="noopener nofollow">$1</a>', $text);

    // Replace Markdown bold: **text** -> <strong>text</strong>
    $text = preg_replace('/\\\\*\\\\*([^*]+)\\\\*\\\\*/', '<strong>$1</strong>', $text);

    // Format list items
    $lines = array_filter(array_map('trim', explode("\\n", $text)));
    $html = '';

    if ($type === 'steps') {
        $html .= '<div style="display: flex; flex-direction: column; gap: 20px; margin-top: 15px;">';
        $index = 1;
        foreach ($lines as $line) {
            // Remove leading step numbers: e.g. "1. ", "Step 1: "
            $cleaned = preg_replace(\'/^(\\\\d+[\\\\.\\\\)]|[-•–\\\\*]|Step\\\\s+\\\\d+:?)\\\\s+/i\', \'\', $line);
            
            // Look for colons for key-value styling (e.g. "Step Name: Step details")
            $colon_index = strpos($cleaned, \':\');
            if ($colon_index !== false && $colon_index < 45) {
                $key = trim(substr($cleaned, 0, $colon_index));
                $val = trim(substr($cleaned, $colon_index + 1));
                
                $key = preg_replace(\'/^\\\\*\\\\*|\\\\*\\\\*$/\', \'\', $key); // strip any extra bold markers
                
                $html .= \'<div style="display: flex; gap: 15px;">\';
                $html .= \'<span style="flex-shrink: 0; width: 24px; height: 24px; background: #e0e7ff; color: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">\' . $index . \'</span>\';
                $html .= \'<div style="flex-1;">\';
                $html .= \'<strong style="font-weight: 800; color: #1e293b; display: block; margin-bottom: 4px;">\' . esc_html($key) . \'</strong>\';
                $html .= \'<p style="margin: 0; color: #475569; font-size: 15px; line-height: 1.6;">\' . wp_kses_post($val) . \'</p>\';
                $html .= \'</div></div>\';
            } else {
                $html .= \'<div style="display: flex; gap: 15px;">\';
                $html .= \'<span style="flex-shrink: 0; width: 24px; height: 24px; background: #e0e7ff; color: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">\' . $index . \'</span>\';
                $html .= \'<div style="flex-1; color: #475569; font-size: 15px; line-height: 1.6;">\' . wp_kses_post($cleaned) . \'</div>\';
                $html .= \'</div>\';
            }
            $index++;
        }
        $html .= \'</div>\';
    } else {
        // Standard bullet/comma list
        $html .= \'<div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">\';
        foreach ($lines as $line) {
            $cleaned = preg_replace(\'/^([-•–\\\\*]|\\\\d+[\\\\.\\\\)])\\\\s+/\', \'\', $line);
            
            // Check for key-value pair (e.g. "Income Limit: Below 2.5 Lakhs")
            $colon_index = strpos($cleaned, \':\');
            if ($colon_index !== false && $colon_index < 45) {
                $key = trim(substr($cleaned, 0, $colon_index));
                $val = trim(substr($cleaned, $colon_index + 1));
                
                $key = preg_replace(\'/^\\\\*\\\\*|\\\\*\\\\*$/\', \'\', $key); // strip bold markers
                
                $html .= \'<div style="display: flex; items-start; gap: 10px; font-size: 15px; line-height: 1.6; color: #475569;">\';
                $html .= \'<span style="color: #94a3b8; flex-shrink: 0;">—</span>\';
                $html .= \'<div><strong style="color: #1e293b; font-weight: bold; margin-right: 6px;">\' . esc_html($key) . \':</strong>\' . wp_kses_post($val) . \'</div>\';
                $html .= \'</div>\';
            } else {
                $html .= \'<div style="display: flex; items-start; gap: 10px; font-size: 15px; line-height: 1.6; color: #475569;">\';
                $html .= \'<span style="color: #94a3b8; flex-shrink: 0;">—</span>\';
                $html .= \'<div>\' . wp_kses_post($cleaned) . \'</div>\';
                $html .= \'</div>\';
            }
        }
        $html .= \'</div>\';
    }

    return $html;
}
?>

<style>
.scholarship-container {
    max-width: 1100px;
    margin: 30px auto;
    padding: 0 20px;
    font-family: \'Outfit\', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.scholarship-header {
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    color: white;
    padding: 40px;
    border-radius: 20px;
    margin-bottom: 30px;
    box-shadow: 0 10px 25px rgba(30,60,114,0.15);
}
.scholarship-header h1 {
    font-size: 32px;
    font-weight: 800;
    margin: 0 0 15px 0;
    line-height: 1.25;
    color: white;
}
.scholarship-meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    font-size: 15px;
    opacity: 0.9;
}
.scholarship-meta-row span {
    background: rgba(255,255,255,0.1);
    padding: 6px 12px;
    border-radius: 6px;
}
.scholarship-layout {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
}
.scholarship-main-content {
    flex: 1 1 700px;
}
.scholarship-sidebar {
    flex: 0 0 320px;
    position: sticky;
    top: 100px;
    height: fit-content;
}
.card-box {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 30px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}
.sidebar-cta-card {
    background: #f8fafc;
    border: 2px solid #3b82f6;
    text-align: center;
}
.cta-button {
    display: block;
    background: #2563eb;
    color: white;
    text-decoration: none;
    padding: 14px 20px;
    border-radius: 10px;
    font-weight: bold;
    margin-top: 15px;
    transition: background 0.2s;
}
.cta-button:hover {
    background: #1d4ed8;
    color: white;
}
.anchor-nav {
    display: flex;
    overflow-x: auto;
    gap: 10px;
    background: #fff;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 100;
    margin-bottom: 30px;
    scrollbar-width: none;
}
.anchor-nav::-webkit-scrollbar { display: none; }
.anchor-nav a {
    white-space: nowrap;
    padding: 8px 16px;
    background: #f1f5f9;
    color: #475569;
    text-decoration: none;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 700;
    transition: all 0.2s;
}
.anchor-nav a:hover {
    background: #2563eb;
    color: white;
}
.mini-table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
}
.mini-table td {
    padding: 12px;
    border-bottom: 1px solid #f1f5f9;
}
.mini-table tr td:first-child {
    font-weight: bold;
    color: #64748b;
    width: 35%;
}
.lead-answer {
    font-size: 18px;
    line-height: 1.6;
    color: #334155;
    border-left: 4px solid #3b82f6;
    padding-left: 15px;
    margin-bottom: 30px;
}
@media (max-width: 768px) {
    .scholarship-sidebar {
        flex: 1 1 100%;
        position: static;
        order: -1;
    }
    .scholarship-header {
        padding: 25px;
    }
}
</style>

<div class="scholarship-container">
    <?php while ( have_posts() ) : the_post(); ?>
        
        <!-- Hero Header -->
        <header class="scholarship-header">
            <h1><?php the_title(); ?></h1>
            <div class="scholarship-meta-row">
                <span>🏢 Provider: <?php echo esc_html($provider ?: 'Government/Corporate'); ?></span>
                <span>🎓 Class: <?php echo esc_html($level_list ?: 'All Students'); ?></span>
                <span>📍 State: <?php echo esc_html($state ?: 'All India'); ?></span>
            </div>
        </header>

        <!-- Anchor Navigation Pills -->
        <div class="anchor-nav">
            <a href="#overview">📊 Overview</a>
            <a href="#eligibility">🎯 Eligibility</a>
            <a href="#benefits">💰 Benefits</a>
            <a href="#apply-online">📝 How to Apply</a>
            <a href="#documents-required">📄 Documents</a>
            <a href="#faqs">❓ FAQs</a>
        </div>

        <div class="scholarship-layout">
            
            <!-- Left Main Content Area -->
            <div class="scholarship-main-content">
                
                <section id="overview" class="card-box">
                    <h2>Overview & Summary</h2>
                    <?php if ($intro_seo) : ?>
                        <div class="lead-answer"><?php echo wp_kses_post($intro_seo); ?></div>
                    <?php endif; ?>
                    
                    <table class="mini-table">
                        <tr>
                            <td>Scholarship Name</td>
                            <td><?php the_title(); ?></td>
                        </tr>
                        <tr>
                            <td>Annual Amount</td>
                            <td style="color:#10b981; font-weight:bold;"><?php echo esc_html($amount_display); ?></td>
                        </tr>
                        <tr>
                            <td>Current Status</td>
                            <td>
                                <span style="background:<?php echo $is_open ? '#def7ec' : '#fde8e8'; ?>; color:<?php echo $is_open ? '#03543f' : '#9b1c1c'; ?>; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:12px;">
                                    <?php echo $is_open ? 'Open / Active' : 'Closed'; ?>
                                </span>
                            </td>
                        </tr>
                        <?php if ($deadline) : ?>
                        <tr>
                            <td>Last Date to Apply</td>
                            <td><?php echo esc_html(date('d M Y', strtotime($deadline))); ?></td>
                        </tr>
                        <?php endif; ?>
                    </table>
                </section>

                <!-- About the Program -->
                <?php if ($intro_seo) : ?>
                    <section class="card-box">
                        <h2>About the Program</h2>
                        <p style="font-size: 15px; color: #334155; line-height: 1.6; whitespace: pre-line;">
                            <?php echo wp_kses_post($intro_seo); ?>
                        </p>
                    </section>
                <?php endif; ?>

                <!-- Benefits & Financial Support -->
                <section id="benefits" class="card-box">
                    <h2>Benefits & Financial Support</h2>
                    <p style="font-size: 28px; font-weight: 900; color: #1e293b; margin: 0 0 10px 0;">
                        <?php echo esc_html($amount_display); ?>
                    </p>
                    <?php if ($amount_description) : ?>
                        <p style="font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
                            <?php 
                            $clean_desc = str_replace(
                                array(\'amount_annual_inr\', \'amount_min_inr\', \'"\', "\'"),
                                array(\'annual amount\', \'minimum stipend\', \'\', \'\'),
                                $amount_description
                            );
                            echo esc_html($clean_desc); 
                            ?>
                        </p>
                    <?php endif; ?>
                    <?php if ($benefits) : ?>
                        <?php echo is_render_markdown_as_html($benefits); ?>
                    <?php endif; ?>
                    <?php if ($special_conditions) : ?>
                        <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; gap: 10px;">
                            <span style="color: #64748b; font-weight: bold; flex-shrink: 0;">ℹ️ Note:</span>
                            <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.6;"><?php echo esc_html($special_conditions); ?></p>
                        </div>
                    <?php endif; ?>
                </section>

                <!-- Eligibility Criteria & Income Limit -->
                <section id="eligibility" class="card-box">
                    <h2>Eligibility Criteria & Income Limit</h2>
                    <table class="mini-table">
                        <tr>
                            <td>Education Level</td>
                            <td><?php echo esc_html($level_list ?: \'All Students\'); ?></td>
                        </tr>
                        <?php if ($course_stream) : ?>
                        <tr>
                            <td>Course / Stream</td>
                            <td><?php echo esc_html($course_stream); ?></td>
                        </tr>
                        <?php endif; ?>
                        <tr>
                            <td>Minimum Marks</td>
                            <td><?php echo $min_marks > 0 ? esc_html($min_marks) . \'%\' : \'No minimum cutoff / Open to all grades\'; ?></td>
                        </tr>
                        <tr id="income-limit">
                            <td>Income Limit</td>
                            <td><?php echo $income_limit > 0 ? \'Up to ₹\' . number_format($income_limit) . \'/year\' : \'No income bar / Open to all income groups\'; ?></td>
                        </tr>
                        <tr>
                            <td>Category / Caste</td>
                            <td><?php echo esc_html($caste ?: \'Open to all categories (General, OBC, SC, ST, EWS)\'); ?></td>
                        </tr>
                        <tr>
                            <td>Domicile State</td>
                            <td><?php echo esc_html($state ?: \'All India / Open to all states\'); ?></td>
                        </tr>
                        <?php if ($gender && strtolower($gender) !== \'all\') : ?>
                        <tr>
                            <td>Gender Allowed</td>
                            <td><?php echo esc_html($gender); ?></td>
                        </tr>
                        <?php endif; ?>
                    </table>
                    
                    <div style="margin-top: 25px; line-height: 1.6;">
                        <?php the_content(); ?>
                    </div>
                </section>

                <!-- Mandatory Documents Checklist -->
                <section id="documents-required" class="card-box">
                    <h2>Mandatory Documents Checklist</h2>
                    <?php if ($docs_needed) : ?>
                        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                            <?php 
                            $docs = array_filter(array_map(\'trim\', explode(\',\', $docs_needed)));
                            foreach ($docs as $doc) : 
                            ?>
                                <div style="display: flex; align-items: start; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 15px; border-radius: 8px; font-size: 14px; color: #1e293b;">
                                    <span style="color: #10b981; font-weight: bold;">✓</span>
                                    <span><?php echo esc_html($doc); ?></span>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php else : ?>
                        <p>Standard documents required: Aadhaar Card, Student ID, Previous marksheet, and Bank passbook.</p>
                    <?php endif; ?>
                </section>

                <!-- Selection Process -->
                <?php if ($selection) : ?>
                <section id="selection-process" class="card-box">
                    <h2>Selection Process</h2>
                    <div style="line-height: 1.6;">
                        <?php echo is_render_markdown_as_html($selection); ?>
                    </div>
                </section>
                <?php endif; ?>

                <!-- Renewal Policy -->
                <?php if ($renewal) : ?>
                <section id="renewal-process" class="card-box">
                    <h2>Renewal Policy</h2>
                    <div style="line-height: 1.6;">
                        <?php echo is_render_markdown_as_html($renewal); ?>
                    </div>
                </section>
                <?php endif; ?>

                <!-- How to Apply Online -->
                <section id="apply-online" class="card-box">
                    <h2>How to Apply Online</h2>
                    <p style="font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
                        Applications are submitted online via <strong><?php echo esc_html($application_mode ?: \'the official portal\'); ?></strong>. Complete eKYC, upload scanned documents, and submit before the closing date.
                    </p>
                    <?php if ($step_guide) : ?>
                        <?php echo is_render_markdown_as_html($step_guide, \'steps\'); ?>
                    <?php endif; ?>
                </section>

                <!-- Apply Links -->
                <section class="card-box">
                    <h2>Apply Links</h2>
                    <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                        <div>
                            <h4 style="margin: 0 0 5px 0; font-weight: bold; color: #1e293b;">Ready to apply?</h4>
                            <p style="margin: 0; font-size: 13px; color: #64748b;">This takes you to the official portal. IndiaScholarships doesn\'t process applications or charge any fee.</p>
                        </div>
                        <?php if ($apply_url) : ?>
                            <a href="<?php echo esc_url($apply_url); ?>" target="_blank" rel="noopener nofollow" style="background: #2563eb; color: white; padding: 10px 18px; border-radius: 6px; font-weight: bold; font-size: 14px; text-decoration: none;">
                                Go to official portal ↗
                            </a>
                        <?php else : ?>
                            <span style="font-size: 14px; color: #94a3b8; font-weight: bold;">Official link not available</span>
                        <?php endif; ?>
                    </div>
                </section>

                <!-- Help & Contact Support -->
                <section class="card-box">
                    <h2>Help & Contact Support</h2>
                    <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 15px;">
                        <?php if ($official_source) : ?>
                            <div style="display: flex; align-items: center; gap: 10px; font-size: 14px;">
                                <span>🌐</span>
                                <a href="<?php echo esc_url($official_source); ?>" target="_blank" rel="noopener noreferrer" style="color: #2563eb; font-weight: 600; text-decoration: none;">Visit official portal ↗</a>
                            </div>
                        <?php endif; ?>
                        <div style="display: flex; align-items: center; gap: 10px; font-size: 14px; color: #334155;">
                            <span>📞</span>
                            <span>Helpline: <?php echo esc_html($helpline ?: \'Contact official support\'); ?></span>
                        </div>
                    </div>
                    <p style="font-size: 13px; color: #64748b; margin: 0 0 15px 0;">Not sure if you qualify?</p>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <a href="/guides/" style="padding: 8px 16px; border: 1px solid #e2e8f0; color: #475569; text-decoration: none; font-size: 13px; font-weight: bold; border-radius: 4px;">Browse Guides</a>
                        <a href="/eligibility-checker/" style="padding: 8px 16px; border: 1px solid #e2e8f0; color: #475569; text-decoration: none; font-size: 13px; font-weight: bold; border-radius: 4px;">Check Eligibility</a>
                    </div>
                </section>

                <!-- Official Last Date & Timelines -->
                <section id="last-date" class="card-box">
                    <h2>Official Last Date & Timelines</h2>
                    <p style="font-size: 20px; font-weight: bold; color: #1e293b; margin: 0 0 5px 0;">
                        <?php 
                        if ($always_open) {
                            echo \'Open Year-Round (Continuous Enrollment)\';
                        } elseif ($deadline) {
                            echo esc_html(date(\'d F Y\', strtotime($deadline)));
                        } else {
                            echo \'Continuous Enrollment / Check Official Portal\';
                        }
                        ?>
                    </p>
                    <?php if ($deadline_description) : ?>
                        <p style="font-size: 13px; color: #64748b; font-style: italic; margin-bottom: 12px;"><?php echo esc_html($deadline_description); ?></p>
                    <?php endif; ?>
                    <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
                        Dates are subject to change per the provider\'s official notification. Apply well before the closing date.
                    </p>
                </section>

                <!-- FAQs Section -->
                <?php 
                if ($faq_json) {
                    $faqs = json_decode($faq_json, true);
                    if (is_array($faqs) && count($faqs) > 0) {
                        ?>
                        <section id="faqs" class="card-box">
                            <h2>Common Questions (FAQs)</h2>
                            <div style="margin-top: 15px;">
                                <?php foreach ($faqs as $faq) : 
                                    $q = isset($faq[\'question\']) ? $faq[\'question\'] : (isset($faq[\'q\']) ? $faq[\'q\'] : \'\');
                                    $a = isset($faq[\'answer\']) ? $faq[\'answer\'] : (isset($faq[\'a\']) ? $faq[\'a\'] : \'\');
                                    if (!$q) continue;
                                ?>
                                    <details style="border-bottom: 1px solid #f1f5f9; padding: 15px 0; cursor: pointer;">
                                        <summary style="font-weight: 700; color: #1e293b; font-size: 15px; display: flex; justify-content: space-between; align-items: center;">
                                            <span><?php echo esc_html($q); ?></span>
                                            <span style="font-size: 12px; color: #94a3b8;">▼</span>
                                        </summary>
                                        <p style="color: #475569; margin: 10px 0 0 0; line-height: 1.6; font-size: 14px; cursor: default;">
                                            <?php echo esc_html($a); ?>
                                        </p>
                                    </details>
                                <?php endforeach; ?>
                            </div>
                        </section>
                        <?php
                    }
                }
                ?>
            </div>

            <!-- Right Column Sidebar Actions -->
            <div class="scholarship-sidebar">
                <div class="card-box sidebar-cta-card">
                    <h3 style="margin-top:0; color:#1e293b; font-weight:800;">Application Summary</h3>
                    
                    <div style="font-size:24px; font-weight:800; color:#10b981; margin:15px 0;">
                        <?php echo esc_html($amount_display); ?>
                    </div>
                    
                    <p style="font-size:14px; color:#64748b;">
                        Deadline: <strong><?php echo $deadline ? date(\'d M Y\', strtotime($deadline)) : \'Open\'; ?></strong>
                    </p>

                    <?php if ($apply_url) : ?>
                        <a href="<?php echo esc_url($apply_url); ?>" target="_blank" rel="noopener nofollow" class="cta-button">
                            🌐 Apply Online Direct
                        </a>
                    <?php endif; ?>
                    
                    <?php if ($helpline) : ?>
                        <div style="margin-top:20px; border-top:1px solid #e2e8f0; padding-top:15px; text-align:left; font-size:13px;">
                            <strong>Helpline Support:</strong>
                            <p style="margin:5px 0 0 0; color:#64748b; font-family:monospace;"><?php echo esc_html($helpline); ?></p>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

        </div>

    <?php endwhile; ?>
</div>

<?php 
generate_construct_sidebars();
get_footer();
`;

// 4. taxonomy-scholarship_state.php
const taxonomyStatePhp = `<?php
/**
 * The template for displaying scholarship states archive page
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

get_header(); 

$term = get_queried_object();
$state_name = $term->name;
?>

<style>
.state-hub-container {
    max-width: 1100px;
    margin: 30px auto;
    padding: 0 20px;
    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.state-hub-header {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 40px;
    border-radius: 20px;
    margin-bottom: 40px;
    box-shadow: 0 10px 25px rgba(16,185,129,0.15);
}
.state-hub-header h1 {
    font-size: 36px;
    font-weight: 800;
    margin: 0 0 15px 0;
    color: white;
}
.matrix-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 40px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
    overflow-x: auto;
}
.matrix-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}
.matrix-table th {
    background: #f8fafc;
    padding: 14px;
    font-weight: 800;
    text-align: left;
    border-bottom: 2px solid #e2e8f0;
    color: #475569;
}
.matrix-table td {
    padding: 14px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
}
.matrix-table tr:hover td {
    background: #f8fafc;
}
.badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 11px;
}
.badge-green { background: #def7ec; color: #03543f; }
.badge-blue { background: #e1effe; color: #1e429f; }
.list-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 25px;
    margin-top: 30px;
}
.scheme-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
    transition: transform 0.2s, box-shadow 0.2s;
}
.scheme-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 20px rgba(0,0,0,0.05);
}
.scheme-card h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
    font-weight: 800;
    line-height: 1.4;
}
.scheme-card h3 a {
    color: #1e293b;
    text-decoration: none;
}
.scheme-card h3 a:hover {
    color: #2563eb;
}
</style>

<div class="state-hub-container">
    
    <!-- State Hub Header -->
    <header class="state-hub-header">
        <h1>Scholarships in <?php echo esc_html($state_name); ?> 2026</h1>
        <p style="font-size:18px; margin:0; opacity:0.95;">
            Explore the latest list of verified state government and private scholarships for students in <?php echo esc_html($state_name); ?>.
        </p>
    </header>

    <!-- Comparison Matrix Table -->
    <section class="matrix-card">
        <h2 style="margin-top:0; margin-bottom:20px; font-weight:800; color:#1e293b;">📋 State Comparison Matrix</h2>
        <table class="matrix-table">
            <thead>
                <tr>
                    <th>Scholarship Scheme</th>
                    <th>Annual Amount</th>
                    <th>Eligibility Level</th>
                    <th>Deadline</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <?php 
                if ( have_posts() ) :
                    while ( have_posts() ) : the_post(); 
                        $amt = get_field('amount_annual');
                        $desc = get_field('amount_description');
                        $lvl = get_field('level');
                        $dl = get_field('deadline');
                        
                        $is_open = !$dl || new DateTime($dl) >= new DateTime();
                        $lvl_str = is_array($lvl) ? implode(', ', $lvl) : $lvl;
                        ?>
                        <tr>
                            <td><strong><a href="<?php the_permalink(); ?>" style="color:#1e293b; text-decoration:none;"><?php the_title(); ?></a></strong></td>
                            <td style="color:#10b981; font-weight:bold;"><?php echo esc_html(is_format_amount($amt, $desc)); ?></td>
                            <td><?php echo esc_html($lvl_str ?: 'All Students'); ?></td>
                            <td><?php echo $dl ? esc_html(date('d M Y', strtotime($dl))) : 'Open'; ?></td>
                            <td>
                                <span class="badge <?php echo $is_open ? 'badge-green' : 'badge-red'; ?>">
                                    <?php echo $is_open ? 'Open' : 'Closed'; ?>
                                </span>
                            </td>
                        </tr>
                        <?php
                    endwhile;
                endif;
                rewind_posts();
                ?>
            </tbody>
        </table>
    </section>

    <!-- Scheme Listing Grid -->
    <section>
        <h2 style="font-weight:800; color:#1e293b;">🎓 Verified Schemes Directory</h2>
        <div class="list-grid">
            <?php 
            if ( have_posts() ) :
                while ( have_posts() ) : the_post(); 
                    $amt = get_field('amount_annual');
                    $desc = get_field('amount_description');
                    $dl = get_field('deadline');
                    $prov = get_field('provider');
                    ?>
                    <article class="scheme-card">
                        <div>
                            <span class="badge badge-blue" style="margin-bottom:12px; display:inline-block;">
                                <?php echo esc_html($prov ?: 'State Scheme'); ?>
                            </span>
                            <h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
                            <p style="font-size:14px; color:#64748b; line-height:1.5;">
                                Apply before: <strong><?php echo $dl ? date('d M Y', strtotime($dl)) : 'Open'; ?></strong>
                            </p>
                        </div>
                        <div style="margin-top:20px; border-top:1px solid #f1f5f9; padding-top:15px; display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-weight:800; color:#10b981; font-size:16px;">
                                <?php echo esc_html(is_format_amount($amt, $desc)); ?>
                            </span>
                            <a href="<?php the_permalink(); ?>" style="color:#2563eb; text-decoration:none; font-weight:bold; font-size:13px;">
                                Details →
                            </a>
                        </div>
                    </article>
                    <?php
                endwhile;
            endif;
            ?>
        </div>
    </section>

</div>

<?php 
generate_construct_sidebars();
get_footer();
`;

// 5. single-portal.php
const singlePortalPhp = `<?php
/**
 * The template for displaying all single Portal pages (CPT: portal)
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

get_header(); 
?>

<style>
.portal-container {
    max-width: 1000px;
    margin: 30px auto;
    padding: 0 20px;
    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.portal-header {
    background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
    color: white;
    padding: 40px;
    border-radius: 20px;
    margin-bottom: 30px;
    box-shadow: 0 10px 25px rgba(79,70,229,0.15);
}
.portal-header h1 {
    font-size: 32px;
    font-weight: 800;
    margin: 0 0 10px 0;
    color: white;
}
.portal-nav-bar {
    display: flex;
    overflow-x: auto;
    gap: 10px;
    background: #fff;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    margin-bottom: 30px;
}
.portal-nav-bar a {
    white-space: nowrap;
    padding: 8px 16px;
    background: #f1f5f9;
    color: #475569;
    text-decoration: none;
    border-radius: 20px;
    font-size: 13px;
    font-weight: bold;
}
.portal-nav-bar a.active {
    background: #4f46e5;
    color: white;
}
.portal-box {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 30px;
}
</style>

<div class="portal-container">
    <?php while ( have_posts() ) : the_post(); 
        $parent_id = wp_get_post_parent_id(get_the_ID());
        $is_child = ($parent_id > 0);
        $portal_slug = $is_child ? get_post_field('post_name', $parent_id) : get_post_field('post_name', get_the_ID());
        $portal_url = get_permalink($is_child ? $parent_id : get_the_ID());
        ?>
        
        <!-- Header -->
        <header class="portal-header">
            <h1><?php the_title(); ?></h1>
            <p style="margin:0; opacity:0.9;">Official Government Scholarship Portal Information Hub</p>
        </header>

        <!-- Portal Menu Bar -->
        <div class="portal-nav-bar">
            <a href="<?php echo esc_url($portal_url); ?>" class="<?php echo !$is_child ? 'active' : ''; ?>">Overview</a>
            <a href="<?php echo esc_url($portal_url . $portal_slug . '-student-login/'); ?>" class="<?php echo (is_single() && strpos(get_post_field('post_name'), 'login') !== false) ? 'active' : ''; ?>">Student Login</a>
            <a href="<?php echo esc_url($portal_url . $portal_slug . '-status-check/'); ?>" class="<?php echo (is_single() && strpos(get_post_field('post_name'), 'status') !== false) ? 'active' : ''; ?>">Status Check</a>
            <a href="<?php echo esc_url($portal_url . $portal_slug . '-documents-list/'); ?>" class="<?php echo (is_single() && strpos(get_post_field('post_name'), 'documents') !== false) ? 'active' : ''; ?>">Documents Checklist</a>
            <a href="<?php echo esc_url($portal_url . $portal_slug . '-scholarships-list/'); ?>" class="<?php echo (is_single() && strpos(get_post_field('post_name'), 'scholarships') !== false) ? 'active' : ''; ?>">Top Scholarships</a>
        </div>

        <!-- Content Box -->
        <main class="portal-box">
            <?php the_content(); ?>
        </main>

    <?php endwhile; ?>
</div>

<?php 
generate_construct_sidebars();
get_footer();
`;

// Write style.css
fs.writeFileSync(path.join(targetDir, 'style.css'), styleCss);

// Write functions.php
fs.writeFileSync(path.join(targetDir, 'functions.php'), functionsPhp);

// Write single-scholarship.php
fs.writeFileSync(path.join(targetDir, 'single-scholarship.php'), singleScholarshipPhp);

// Write taxonomy-scholarship_state.php
fs.writeFileSync(path.join(targetDir, 'taxonomy-scholarship_state.php'), taxonomyStatePhp);

// Write single-portal.php
fs.writeFileSync(path.join(targetDir, 'single-portal.php'), singlePortalPhp);

console.log('✅ Successfully created child theme files inside generatepress-child folder!');
