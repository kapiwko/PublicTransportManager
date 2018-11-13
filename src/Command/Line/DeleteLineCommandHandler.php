<?php

namespace App\Command\Line;

use App\Command\CommandHandlerInterface;
use App\Repository\Line\GetLineById;
use Doctrine\ORM\EntityManagerInterface;

final class DeleteLineCommandHandler implements CommandHandlerInterface
{
    private $entityManager;
    private $getLineById;

    public function __construct(
        EntityManagerInterface $entityManager,
        GetLineById $getLineById
    )
    {
        $this->entityManager = $entityManager;
        $this->getLineById = $getLineById;
    }

    public function __invoke(DeleteLineCommand $command): void
    {
        $line = $this->getLineById->__invoke($command->id());
        if (!$line) {
            throw new \RuntimeException('Line not found');
        }

        $this->entityManager->remove($line);
        $this->entityManager->flush();
    }
}