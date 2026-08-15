<?php
namespace App\Console\Commands;
use App\Services\AcceptanceDatasetService;
use Illuminate\Console\Command;
use Throwable;
class AcceptanceProvision extends Command {
 protected $signature='acceptance:provision {--dry-run : Afficher le plan sans mutation} {--apply : Appliquer le plan}';
 protected $description='Prépare le dataset contrôlé de recette staging';
 public function handle(AcceptanceDatasetService $service):int{
  if(!app()->environment('staging')){$this->error('Refus absolu hors staging.');return self::FAILURE;}
  if($this->option('apply')&&$this->option('dry-run')){$this->error('Choisir --dry-run ou --apply.');return self::FAILURE;}
  try {
   $plan=$service->inspect();
   $this->line(json_encode($plan,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
   if(!$this->option('apply')){$this->info('DRY-RUN : aucune mutation.');return ($plan['dependencies']||$plan['conflicts'])?self::FAILURE:self::SUCCESS;}
   $manifest=$service->provision($plan);$this->info('Provisioning réussi. Run-id : '.$manifest['run_id']);return self::SUCCESS;
  } catch(Throwable $e) {$this->error($e->getMessage());return self::FAILURE;}
 }
}
