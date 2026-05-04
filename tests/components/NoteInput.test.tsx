import { test, expect } from '@playwright/experimental-ct-react';
import NoteInput from '../../src/components/NoteInput';

test.describe('NoteInput', () => {
  test('submit button is disabled when textarea is empty', async ({ mount }) => {
    const component = await mount(<NoteInput onSubmit={() => {}} />);
    const button = component.getByRole('button', { name: 'Add Note' });
    await expect(button).toBeDisabled();
  });

  test('submit button is enabled with text', async ({ mount }) => {
    const component = await mount(<NoteInput onSubmit={() => {}} />);
    await component.getByRole('textbox').fill('Hello');
    const button = component.getByRole('button', { name: 'Add Note' });
    await expect(button).toBeEnabled();
  });

  test('submits trimmed text and clears textarea', async ({ mount }) => {
    let submitted = '';
    const component = await mount(
      <NoteInput onSubmit={(text) => { submitted = text; }} />,
    );
    await component.getByRole('textbox').fill('  Hello world  ');
    await component.getByRole('button', { name: 'Add Note' }).click();
    expect(submitted).toBe('Hello world');
    await expect(component.getByRole('textbox')).toHaveValue('');
  });

  test('does not submit whitespace-only text', async ({ mount }) => {
    let called = false;
    const component = await mount(
      <NoteInput onSubmit={() => { called = true; }} />,
    );
    await component.getByRole('textbox').fill('   ');
    const button = component.getByRole('button', { name: 'Add Note' });
    await expect(button).toBeDisabled();
    expect(called).toBe(false);
  });

  test('Cmd+Enter submits the note', async ({ mount }) => {
    let submitted = '';
    const component = await mount(
      <NoteInput onSubmit={(text) => { submitted = text; }} />,
    );
    await component.getByRole('textbox').fill('Quick note');
    await component.getByRole('textbox').press('Meta+Enter');
    expect(submitted).toBe('Quick note');
  });
});
