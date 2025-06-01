import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js to use WASM
env.useBrowserCache = false;
env.allowLocalModels = false;

async function testLLM() {
  console.log('Testing LLM model Xenova/distilgpt2...');
  
  try {
    console.log('Initializing pipeline...');
    const generator = await pipeline('text-generation', 'Xenova/distilgpt2');
    
    console.log('Generating test response...');
    const result = await generator('Tell me a short story about a wise owl', {
      max_new_tokens: 50,
      temperature: 0.7,
      do_sample: true,
      no_repeat_ngram_size: 2
    });
    
    console.log('\nGenerated Response:');
    console.log(result[0].generated_text);
    console.log('\nModel test completed successfully!');
    
  } catch (error) {
    console.error('Error testing LLM:');
    console.error(error);
  }
}

testLLM();