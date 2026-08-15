// scripts/build-child-theme-v2.js
// Generates the minimal child theme containing only stylesheet configuration and programmatic registration of CPTs and Taxonomies.
// Leaves all UI layout decisions completely to the WordPress database (GP Elements + Gutenberg).
// Run: node scripts/build-child-theme-v2.js

const fs = require('fs');
const path = require('path');

const targetDir = '/Users/roshankumar/Desktop/Wordpress/generatepress-child';

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 1. Clean, minimal style.css (Version 2.0.0)
const styleCss = `/*
 Theme Name:   GeneratePress Child
 Theme URI:    https://generatepress.com
 Description:  Minimal GeneratePress Child Theme for IndiaScholarships. Registers backend CPTs and taxonomies. Layouts are managed visually in GP Elements.
 Author:       Antigravity
 Template:     generatepress
 Version:      2.0.0
*/

/* Add any custom CSS classes you want to use inside the block editor below */
`;

// 2. functions.php (CPT + Taxonomy registrations + Sync endpoint + scholarship_gender taxonomy)
const functionsPhp = `<?php
add_action( 'wp_enqueue_scripts', 'gp_child_enqueue_styles' );
function gp_child_enqueue_styles() {
    wp_enqueue_style( 'parent-style', get_template_directory_uri() . '/style.css' );
    wp_enqueue_style( 'child-style', get_stylesheet_directory_uri() . '/style.css', array('parent-style'), time() );
}

// Programmatic Custom Post Types Registration (Late priority 99 to ensure ours wins!)
add_action( 'init', 'is_register_custom_post_types', 99 );
function is_register_custom_post_types() {
    // 1. Scholarship CPT
    register_post_type( 'scholarship', array(
        'label'               => 'Scholarships',
        'public'              => true,
        'has_archive'         => true,
        'show_in_rest'        => true,
        'hierarchical'        => false,
        'supports'            => array( 'title', 'editor', 'thumbnail', 'custom-fields', 'excerpt' ),
        'rewrite'             => array( 'slug' => 'scholarships', 'with_front' => false ),
    ) );

    // 2. Guide CPT
    register_post_type( 'guide', array(
        'label'               => 'Guides',
        'public'              => true,
        'has_archive'         => true,
        'show_in_rest'        => true,
        'hierarchical'        => true,
        'supports'            => array( 'title', 'editor', 'thumbnail', 'page-attributes', 'excerpt' ),
        'rewrite'             => array( 'slug' => 'guides', 'with_front' => false, 'hierarchical' => true ),
    ) );

    // 3. News CPT
    register_post_type( 'news', array(
        'label'               => 'News',
        'public'              => true,
        'has_archive'         => true,
        'show_in_rest'        => true,
        'hierarchical'        => false,
        'supports'            => array( 'title', 'editor', 'thumbnail', 'excerpt' ),
        'rewrite'             => array( 'slug' => 'news', 'with_front' => false ),
    ) );

    // 4. Portal CPT
    register_post_type( 'portal', array(
        'label'               => 'Portals',
        'public'              => true,
        'has_archive'         => true,
        'show_in_rest'        => true,
        'hierarchical'        => true,
        'supports'            => array( 'title', 'editor', 'thumbnail', 'page-attributes', 'excerpt' ),
        'rewrite'             => array( 'slug' => 'guides/portal', 'with_front' => false, 'hierarchical' => true ),
    ) );
}

// Programmatic Custom Taxonomies Registration (Late priority 99 to ensure ours wins!)
add_action( 'init', 'is_register_custom_taxonomies', 99 );
function is_register_custom_taxonomies() {
    // 1. Domicile State
    register_taxonomy( 'scholarship_state', array( 'scholarship' ), array(
        'hierarchical'      => true,
        'label'             => 'States',
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'scholarships-in', 'with_front' => false ),
    ) );

    // 2. Caste Category
    register_taxonomy( 'scholarship_category', array( 'scholarship' ), array(
        'hierarchical'      => true,
        'label'             => 'Categories',
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'scholarships-for', 'with_front' => false ),
    ) );

    // 3. Education Level
    register_taxonomy( 'scholarship_level', array( 'scholarship' ), array(
        'hierarchical'      => true,
        'label'             => 'Education Levels',
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'scholarships-level', 'with_front' => false ),
    ) );

    // 4. Course Stream
    register_taxonomy( 'scholarship_course', array( 'scholarship' ), array(
        'hierarchical'      => true,
        'label'             => 'Courses',
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'scholarships-by-course-stream', 'with_front' => false ),
    ) );

    // 5. Gender Taxonomy
    register_taxonomy( 'scholarship_gender', array( 'scholarship' ), array(
        'hierarchical'      => true,
        'label'             => 'Genders',
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'scholarships-for-gender', 'with_front' => false ),
    ) );
}

// Clean taxonomy arrays from double quotes, single quotes, and square brackets
function is_clean_taxonomy_terms($val_str) {
    if (!$val_str) return array();
    $clean = str_replace(array('[', ']', '"', "'"), '', $val_str);
    $parts = explode(',', $clean);
    return array_filter(array_map('trim', $parts));
}

// Dynamic taxonomies synchronizer hook on post save
add_action( 'acf/save_post', 'is_sync_acf_to_taxonomies', 20 );
function is_sync_acf_to_taxonomies( $post_id ) {
    if ( get_post_type( $post_id ) !== 'scholarship' ) {
        return;
    }

    // 1. State -> scholarship_state
    $state_val = get_field('state', $post_id);
    if ( $state_val ) {
        $states = is_clean_taxonomy_terms($state_val);
        $term_ids = array();
        foreach ( $states as $st ) {
            $term = term_exists( $st, 'scholarship_state' );
            if ( ! $term ) {
                $term = wp_insert_term( $st, 'scholarship_state' );
            }
            if ( ! is_wp_error( $term ) && isset( $term['term_id'] ) ) {
                $term_ids[] = (int) $term['term_id'];
            }
        }
        wp_set_object_terms( $post_id, $term_ids, 'scholarship_state' );
    }

    // 2. Caste -> scholarship_category
    $caste_val = get_field('caste', $post_id);
    if ( $caste_val ) {
        $castes = is_clean_taxonomy_terms($caste_val);
        $term_ids = array();
        foreach ( $castes as $cst ) {
            $term = term_exists( $cst, 'scholarship_category' );
            if ( ! $term ) {
                $term = wp_insert_term( $cst, 'scholarship_category' );
            }
            if ( ! is_wp_error( $term ) && isset( $term['term_id'] ) ) {
                $term_ids[] = (int) $term['term_id'];
            }
        }
        wp_set_object_terms( $post_id, $term_ids, 'scholarship_category' );
    }

    // 3. Level -> scholarship_level
    $level_val = get_field('level', $post_id);
    if ( $level_val ) {
        $level_str = is_array($level_val) ? implode(',', $level_val) : $level_val;
        $levels = is_clean_taxonomy_terms($level_str);
        $term_ids = array();
        foreach ( $levels as $lvl ) {
            $term = term_exists( $lvl, 'scholarship_level' );
            if ( ! $term ) {
                $term = wp_insert_term( $lvl, 'scholarship_level' );
            }
            if ( ! is_wp_error( $term ) && isset( $term['term_id'] ) ) {
                $term_ids[] = (int) $term['term_id'];
            }
        }
        wp_set_object_terms( $post_id, $term_ids, 'scholarship_level' );
    }

    // 4. Course -> scholarship_course
    $course_val = get_field('course_stream', $post_id);
    if ( $course_val ) {
        $course_str = is_array($course_val) ? implode(',', $course_val) : $course_val;
        $courses = is_clean_taxonomy_terms($course_str);
        $term_ids = array();
        foreach ( $courses as $cos ) {
            $term = term_exists( $cos, 'scholarship_course' );
            if ( ! $term ) {
                $term = wp_insert_term( $cos, 'scholarship_course' );
            }
            if ( ! is_wp_error( $term ) && isset( $term['term_id'] ) ) {
                $term_ids[] = (int) $term['term_id'];
            }
        }
        wp_set_object_terms( $post_id, $term_ids, 'scholarship_course' );
    }

    // 5. Gender -> scholarship_gender
    $gender_val = get_field('gender', $post_id);
    if ( $gender_val ) {
        $genders = is_clean_taxonomy_terms($gender_val);
        $term_ids = array();
        foreach ( $genders as $gnd ) {
            $term = term_exists( $gnd, 'scholarship_gender' );
            if ( ! $term ) {
                $term = wp_insert_term( $gnd, 'scholarship_gender' );
            }
            if ( ! is_wp_error( $term ) && isset( $term['term_id'] ) ) {
                $term_ids[] = (int) $term['term_id'];
            }
        }
        wp_set_object_terms( $post_id, $term_ids, 'scholarship_gender' );
    }
}

// Bulk sync endpoint hook (URL parameter check)
add_action( 'wp_loaded', 'is_trigger_bulk_taxonomy_sync' );
function is_trigger_bulk_taxonomy_sync() {
    if ( isset($_GET['bulk_sync_tax']) && $_GET['bulk_sync_tax'] === '1' ) {
        $taxonomies = array('scholarship_state', 'scholarship_category', 'scholarship_level', 'scholarship_course', 'scholarship_gender');
        foreach ($taxonomies as $tax) {
            $terms = get_terms(array('taxonomy' => $tax, 'hide_empty' => false));
            if (!empty($terms) && !is_wp_error($terms)) {
                foreach ($terms as $t) {
                    wp_delete_term($t->term_id, $tax);
                }
            }
        }

        $posts = get_posts( array(
            'post_type' => 'scholarship',
            'posts_per_page' => -1,
            'fields' => 'ids'
        ) );
        foreach ( $posts as $pid ) {
            is_sync_acf_to_taxonomies($pid);
        }
        
        flush_rewrite_rules();
        
        echo '✅ Cleaned up old terms, flushed rewrite rules, and synchronized new taxonomies including Gender for ' . count($posts) . ' posts!';
        exit;
    }
}

// Flush rewrite rules on theme switch to ensure CPTs work instantly
add_action( 'after_switch_theme', 'is_flush_rewrite_rules_on_switch' );
function is_flush_rewrite_rules_on_switch() {
    is_register_custom_post_types();
    is_register_custom_taxonomies();
    flush_rewrite_rules();
}

/* ==========================================================================
   NextJS Headless Sync Engine Config
   ========================================================================== */

define('NEXTJS_SYNC_SECRET', 'wp-to-turso-sync-secret-2026');
define('NEXTJS_API_URL', 'https://www.indiascholarships.in/api/sync-wp-to-turso');

// Real-time manual edit triggers
add_action('save_post_scholarship', 'is_sync_scholarship_to_nextjs', 10, 3);
function is_sync_scholarship_to_nextjs($post_id, $post, $update) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (wp_is_post_revision($post_id)) return;
    if (!empty($GLOBALS['wp_all_import_active'])) return;

    wp_remote_post(NEXTJS_API_URL, array(
        'method'      => 'POST',
        'timeout'     => 15,
        'headers'     => array(
            'Content-Type'  => 'application/json',
            'x-sync-secret' => NEXTJS_SYNC_SECRET,
        ),
        'body'        => json_encode(array(
            'post_ids' => array($post_id)
        )),
        'blocking'    => false,
    ));
}

// Global Import Detection Flags (Safeguard Webhook Storms during WP All Import)
add_action('pmxi_before_xml_import', function() {
    $GLOBALS['wp_all_import_active'] = true;
});

add_action('pmxi_after_xml_import', function($import_id, $import_results) {
    $GLOBALS['wp_all_import_active'] = false;
    $imported_post_ids = array();
    if (!empty($import_results) && is_object($import_results)) {
        if (!empty($import_results->updated_posts)) {
            $imported_post_ids = array_merge($imported_post_ids, $import_results->updated_posts);
        }
        if (!empty($import_results->created_posts)) {
            $imported_post_ids = array_merge($imported_post_ids, $import_results->created_posts);
        }
    }
    $imported_post_ids = array_unique(array_filter(array_map('intval', $imported_post_ids)));
    if (empty($imported_post_ids)) return;

    wp_remote_post(NEXTJS_API_URL, array(
        'method'      => 'POST',
        'timeout'     => 45,
        'headers'     => array(
            'Content-Type'  => 'application/json',
            'x-sync-secret' => NEXTJS_SYNC_SECRET,
        ),
        'body'        => json_encode(array(
            'post_ids' => $imported_post_ids
        )),
        'blocking'    => false,
    ));
}, 10, 2);

// Custom Batch REST Endpoint for Next.js to fetch ACF values securely
add_action('rest_api_init', function() {
    register_rest_route('custom-sync/v1', '/batch', array(
        'methods'             => 'GET',
        'callback'            => 'handle_custom_batch_sync_request',
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        }
    ));

    register_rest_route('custom-sync/v1', '/menus', array(
        'methods'             => 'GET',
        'callback'            => 'handle_custom_menus_request',
        'permission_callback' => '__return_true'
    ));
});

function handle_custom_batch_sync_request($request) {
    $ids_param = $request->get_param('ids');
    if (empty($ids_param)) {
        return new WP_Error('missing_params', 'Missing ids param', array('status' => 400));
    }
    $post_ids = array_unique(array_filter(array_map('intval', explode(',', $ids_param))));
    if (empty($post_ids)) return array();

    $posts = get_posts(array(
        'post_type'      => 'scholarship',
        'post_status'    => 'any',
        'include'        => $post_ids,
        'posts_per_page' => -1,
    ));

    $response_data = array();
    foreach ($posts as $post) {
        $acf_fields = function_exists('get_fields') ? get_fields($post->ID) : array();
        $response_data[] = array(
            'id'       => $post->ID,
            'title'    => array('rendered' => $post->post_title),
            'slug'     => $post->post_name,
            'status'   => $post->post_status,
            'date'     => $post->post_date_gmt,
            'modified' => $post->post_modified_gmt,
            'acf'      => $acf_fields,
        );
    }
    return new WP_REST_Response($response_data, 200);
}

// Register Navigation Menu locations in child theme
add_action('after_setup_theme', 'is_child_theme_setup_menus');
function is_child_theme_setup_menus() {
    register_nav_menus( array(
        'primary-menu' => __( 'Header Menu', 'generatepress-child' ),
        'footer-menu'  => __( 'Footer Menu', 'generatepress-child' ),
    ) );
}

// REST callback to fetch Header/Footer menu trees
function handle_custom_menus_request() {
    $menu_locations = get_nav_menu_locations();
    $menus = array();
    foreach ( $menu_locations as $location => $menu_id ) {
        $menu_items = wp_get_nav_menu_items( $menu_id );
        $items = array();
        if ( $menu_items ) {
            foreach ( $menu_items as $item ) {
                $items[] = array(
                    'title' => $item->title,
                    'url'   => $item->url,
                    'target'=> $item->target ? $item->target : '_self',
                );
            }
        }
        $menus[$location] = $items;
    }
    return new WP_REST_Response($menus, 200);
}
?>

`;

// Save clean files
fs.writeFileSync(path.join(targetDir, 'style.css'), styleCss);
fs.writeFileSync(path.join(targetDir, 'functions.php'), functionsPhp);

console.log('✅ Successfully compiled minimal theme v2.0.0 (Data registrations only)!');
