/**
 * @file board-seo-meta.test.tsx
 * @description 게시판 레이아웃 SEO meta 설정 구조 검증 (이슈 #78)
 *
 * 검증 항목:
 * 1. boards.json: meta.seo.extensions, page_type, toggle_setting, vars
 * 2. index.json: meta.seo.extensions, page_type, toggle_setting, vars, _seo 바인딩
 * 3. show.json: meta.seo.extensions, page_type, toggle_setting, vars, _seo 바인딩
 */

import { describe, it, expect } from 'vitest';
import boardsLayout from '../../../layouts/board/boards.json';
import indexLayout from '../../../layouts/board/index.json';
import showLayout from '../../../layouts/board/show.json';

// JSON 내 문자열 포함 여부 검사 헬퍼
function jsonContains(obj: unknown, str: string): boolean {
    return JSON.stringify(obj).includes(str);
}

describe('boards.json - SEO meta 설정', () => {
    const seo = (boardsLayout as any).meta?.seo;

    it('meta.seo가 존재한다', () => {
        expect(seo).toBeDefined();
    });

    it('enabled가 true이다', () => {
        expect(seo.enabled).toBe(true);
    });

    it('extensions에 sirsoft-board 모듈이 포함된다', () => {
        const ext = seo.extensions;
        expect(Array.isArray(ext)).toBe(true);
        const hasSirsoftBoard = ext.some(
            (e: any) => e.type === 'module' && e.id === 'sirsoft-board'
        );
        expect(hasSirsoftBoard, 'sirsoft-board extension이 없다').toBe(true);
    });

    it('page_type이 boards이다', () => {
        expect(seo.page_type).toBe('boards');
    });

    it('toggle_setting이 seo.seo_boards를 참조한다', () => {
        expect(seo.toggle_setting).toBe('$module_settings:sirsoft-board:seo.seo_boards');
    });

    it('vars에 site_name이 정의된다', () => {
        expect(seo.vars).toBeDefined();
        expect(seo.vars.site_name).toBe('$core_settings:general.site_name');
    });

    it('auth_mode가 optional이다 (봇 접근 허용)', () => {
        const ds = (boardsLayout as any).data_sources as any[];
        const boardListDs = ds?.find((d: any) => d.id === 'boardList');
        expect(boardListDs).toBeDefined();
        expect(boardListDs.auth_mode).toBe('optional');
    });
});

describe('index.json - SEO meta 설정', () => {
    const seo = (indexLayout as any).meta?.seo;

    it('meta.seo가 존재한다', () => {
        expect(seo).toBeDefined();
    });

    it('enabled가 true이다', () => {
        expect(seo.enabled).toBe(true);
    });

    it('extensions에 sirsoft-board 모듈이 포함된다', () => {
        const ext = seo.extensions;
        expect(Array.isArray(ext)).toBe(true);
        const hasSirsoftBoard = ext.some(
            (e: any) => e.type === 'module' && e.id === 'sirsoft-board'
        );
        expect(hasSirsoftBoard, 'sirsoft-board extension이 없다').toBe(true);
    });

    it('page_type이 board이다', () => {
        expect(seo.page_type).toBe('board');
    });

    it('toggle_setting이 seo.seo_board를 참조한다', () => {
        expect(seo.toggle_setting).toBe('$module_settings:sirsoft-board:seo.seo_board');
    });

    it('vars에 site_name, board_name, board_description이 정의된다', () => {
        const vars = seo.vars;
        expect(vars).toBeDefined();
        expect(vars.site_name).toBe('$core_settings:general.site_name');
        expect(vars.board_name).toContain('board.name');
        expect(vars.board_description).toContain('board.description');
    });

    it('vars 표현식에 fallback(??)이 있다', () => {
        const vars = seo.vars;
        expect(vars.board_name).toContain('??');
        expect(vars.board_description).toContain('??');
    });

    it('og.description이 _seo 컨텍스트를 참조한다', () => {
        const ogDesc = seo.og?.description ?? '';
        expect(ogDesc).toContain('_seo');
    });
});

describe('show.json - SEO meta 설정', () => {
    const seo = (showLayout as any).meta?.seo;

    it('meta.seo가 존재한다', () => {
        expect(seo).toBeDefined();
    });

    it('enabled가 true이다', () => {
        expect(seo.enabled).toBe(true);
    });

    it('extensions에 sirsoft-board 모듈이 포함된다', () => {
        const ext = seo.extensions;
        expect(Array.isArray(ext)).toBe(true);
        const hasSirsoftBoard = ext.some(
            (e: any) => e.type === 'module' && e.id === 'sirsoft-board'
        );
        expect(hasSirsoftBoard, 'sirsoft-board extension이 없다').toBe(true);
    });

    it('page_type이 post이다', () => {
        expect(seo.page_type).toBe('post');
    });

    it('toggle_setting이 seo.seo_post_detail을 참조한다', () => {
        expect(seo.toggle_setting).toBe('$module_settings:sirsoft-board:seo.seo_post_detail');
    });

    it('vars에 site_name, board_name, post_title이 정의된다', () => {
        const vars = seo.vars;
        expect(vars).toBeDefined();
        expect(vars.site_name).toBe('$core_settings:general.site_name');
        expect(vars.board_name).toContain('board.name');
        expect(vars.post_title).toContain('post.data.title');
    });

    it('vars 표현식에 fallback(??)이 있다', () => {
        const vars = seo.vars;
        expect(vars.board_name).toContain('??');
        expect(vars.post_title).toContain('??');
    });

    it('og.title이 _seo 컨텍스트를 참조한다', () => {
        const ogTitle = seo.og?.title ?? '';
        expect(ogTitle).toContain('_seo');
    });

    it('og.description이 _seo 컨텍스트를 참조한다', () => {
        const ogDesc = seo.og?.description ?? '';
        expect(ogDesc).toContain('_seo');
    });

    // structured_data 는 show.json 정적 선언이 아니라 백엔드(module.php seoStructuredData)가
    // 런타임에 게시글 데이터로 Article 스키마(headline=post.subject 등)를 동적 주입한다. og 는
    // show.json 에 _seo 폴백을 정적 선언하지만 structured_data 는 주입 구조라 정적 키가 없는 게
    // 정상이다. 편집기용 경로 메타(seoStructuredDataMeta)는 BoardModuleSeoTest 에서 검증한다.
    it('structured_data 는 show.json 정적 선언 없음(백엔드 module.php 가 런타임 주입)', () => {
        expect(seo.structured_data).toBeUndefined();
    });

    it('data_sources에 post가 정의된다', () => {
        const ds = (showLayout as any).data_sources as any[];
        const postDs = ds?.find((d: any) => d.id === 'post');
        expect(postDs).toBeDefined();
    });
});
