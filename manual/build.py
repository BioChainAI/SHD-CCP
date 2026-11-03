#!/usr/bin/env python3
"""Render the static manual from chapter fragments and shared navigation.

Run from any directory: python3 /path/to/SHD-CCP/manual/build.py
No network access, packages, or browser runtime are required.
"""
from html import escape
import json
from pathlib import Path
import re
from string import Template

ROOT = Path(__file__).resolve().parent


def load_chapters():
    manifest = json.loads((ROOT / 'navigation.json').read_text())
    chapters = manifest['chapters']
    if not chapters:
        raise ValueError('The manual must contain at least one chapter.')
    seen = set()
    for chapter in chapters:
        slug = chapter['slug']
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug) or slug in seen:
            raise ValueError(f'Invalid or duplicate chapter slug: {slug}')
        seen.add(slug)
        source = (ROOT / 'chapters' / chapter['source']).resolve()
        if source.parent != ROOT / 'chapters' or not source.is_file():
            raise ValueError(f'Missing or invalid chapter source for {slug}')
        if chapter['status'] not in {'available', 'planned'}:
            raise ValueError(f'Invalid chapter status for {slug}')
        chapter['content'] = source.read_text()
    if chapters[0]['slug'] != 'index':
        raise ValueError('The first manual chapter must use the index slug.')
    return chapters


def chapter_link(chapter, label=None):
    return f'<a href="{escape(chapter["slug"])}.html">{escape(label or chapter["title"])}</a>'


def render_navigation(chapters, current):
    items = []
    for chapter in chapters:
        active = chapter is current
        status = '<span class="planned-badge">Planned</span>' if chapter['status'] == 'planned' else ''
        aria = ' aria-current="page"' if active else ''
        css = ' class="active-page"' if active else ''
        item = f'                    <li{css}><a href="{escape(chapter["slug"])}.html"{aria}>{escape(chapter["title"])}{status}</a>'
        if active and chapter.get('sections'):
            item += '\n                        <ul class="section-links">'
            for section in chapter['sections']:
                item += f'\n                            <li><a href="#{escape(section["id"], quote=True)}">{escape(section["title"])}</a></li>'
            item += '\n                        </ul>'
        item += '</li>'
        items.append(item)
    return '\n'.join(items)


def build():
    chapters = load_chapters()
    template = Template((ROOT / 'templates/page.html').read_text())
    for index, chapter in enumerate(chapters):
        previous = chapter_link(chapters[index - 1], '← ' + chapters[index - 1]['title']) if index else '<span></span>'
        if index + 1 < len(chapters):
            following = chapters[index + 1]
            prefix = 'Next planned chapter: ' if following['status'] == 'planned' else 'Next: '
            next_link = chapter_link(following, prefix + following['title'] + ' →')
        else:
            next_link = chapter_link(chapters[0], 'Back to overview →')
        rendered = template.substitute(
            page_title=escape(chapter['title']),
            description=escape(f'SHD-CCP manual: {chapter["title"]}. ' + ('Architecture and theory of operation.' if chapter['status'] == 'available' else 'Planned documentation chapter.')),
            navigation=render_navigation(chapters, chapter),
            content=chapter['content'],
            status_label='Architecture reference' if chapter['status'] == 'available' else 'Planned chapter',
            pagination=f'                {previous}\n                {next_link}',
        )
        (ROOT / f'{chapter["slug"]}.html').write_text(rendered)
    print(f'Rendered {len(chapters)} manual pages.')


if __name__ == '__main__':
    build()
