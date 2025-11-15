import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:5173", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Input email and password and click login button
        frame = context.pages[-1]
        # Input the email for login
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@s3eengenharia.com.br')
        

        frame = context.pages[-1]
        # Input the password for login
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('123456A')
        

        frame = context.pages[-1]
        # Click the login button to submit credentials
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Orçamentos' menu to navigate to budget creation page
        frame = context.pages[-1]
        # Click on 'Orçamentos' menu to navigate to budget creation page
        elem = frame.locator('xpath=html/body/div/div/aside/nav/div[2]/ul/li[2]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Novo Orçamento' button to start creating a new budget
        frame = context.pages[-1]
        # Click on 'Novo Orçamento' button to start creating a new budget
        elem = frame.locator('xpath=html/body/div/div/main/div/header/div[2]/div/button[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill in required fields: select CNPJ, select client, fill project title, validity date, address, and other details to enable item addition
        frame = context.pages[-1]
        # Click on CNPJ dropdown to select a CNPJ
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select a client from the client dropdown
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div/div/div[2]/select').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Input project title
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div/div/div[3]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Instalação Elétrica - Edifício Comercial')
        

        frame = context.pages[-1]
        # Input validity date
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div/div/div[4]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('2025-12-31')
        

        frame = context.pages[-1]
        # Input address
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div/div/div[5]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Rua das Flores, 123')
        

        frame = context.pages[-1]
        # Input neighborhood
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div/div/div[6]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Centro')
        

        frame = context.pages[-1]
        # Input city
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div/div/div[7]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Florianópolis')
        

        frame = context.pages[-1]
        # Input postal code
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div/div/div[8]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('88000-000')
        

        frame = context.pages[-1]
        # Input responsible person
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div/div/div[9]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('João Silva')
        

        frame = context.pages[-1]
        # Input BDI margin percentage
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div/div/div[10]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('20')
        

        # -> Click 'Adicionar Item' button to add multiple materials, modular kits, and services with specified quantities and prices
        frame = context.pages[-1]
        # Click 'Adicionar Item' button to add items to the budget
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div[3]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Add multiple materials, kits, and services with specified quantities and prices
        frame = context.pages[-1]
        # Click on 'Materiais' tab to add materials
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div/div/div[3]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select first material item to add
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div/div[2]/div[2]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Add at least one kit and one service item to the budget, then verify total cost and margin calculations
        frame = context.pages[-1]
        # Click on 'Kits' tab to add kits
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div[5]/div[2]/div/div/div/div/div/div/div/span[7]/span').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Add at least one kit and one service item to the budget, then verify total cost and margin calculations
        frame = context.pages[-1]
        # Click on 'Kits' tab to add kits
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div[5]/div[2]/div/div/div/div/div/div/div/span[6]/span').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Add at least one kit and one service item, then save the budget and verify total cost and margin calculations
        frame = context.pages[-1]
        # Click on 'Kits' tab to add kits
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div[5]/div[2]/div/div/div/div/div/div/div/span[6]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select first kit item to add
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div[5]/div[2]/div/div/div/div/div/div/div/span[6]/div/div/div/div/div/span[11]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Criar Orçamento' button to save the budget and verify total cost and margin calculations
        frame = context.pages[-1]
        # Click 'Criar Orçamento' button to save the budget
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div[6]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Re-select the client from the dropdown to ensure it is properly set, then try saving the budget again
        frame = context.pages[-1]
        # Click on client dropdown to re-select client
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div/div/div[2]/select').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Criar Orçamento' button to save the budget and verify total cost and margin calculations
        frame = context.pages[-1]
        # Click 'Criar Orçamento' button to save the budget and verify calculations
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div[6]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select a client from the client dropdown to enable budget creation
        frame = context.pages[-1]
        # Click on client dropdown to select a client
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div/div/div[2]/select').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select client 'Antônio J Dos Santos' from dropdown
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div/div/div[2]/select').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click 'Criar Orçamento' button to save the budget after client selection
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div[6]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select a client from the client dropdown to enable budget creation
        frame = context.pages[-1]
        # Click on client dropdown to select a client
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div/div/div[2]/select').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select client 'Antônio J Dos Santos' from dropdown
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div/div/div[2]/select').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click 'Criar Orçamento' button to save the budget after client selection
        elem = frame.locator('xpath=html/body/div/div/main/div/form/div[6]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        try:
            await expect(frame.locator('text=Budget Calculation Successful').first).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError("Test case failed: The budget creation process did not complete successfully. Total cost and margin calculations were not verified as correct according to the test plan.")
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    